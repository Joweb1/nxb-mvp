<?php

// ========================================== 
// CONFIGURATION
// ========================================== 

// Security Secret (Change this!)
$CRON_SECRET = 'NXB_MVP_SECURE_CRON_KEY_2026';

// Firebase Config
$FIREBASE_PROJECT_ID = 'nxb-mvp';
$FIREBASE_API_KEY = 'AIzaSyCXgUPEYWFWSTEy6nVIqrzQn8Mbu2oOo9k'; // From firebaseConfig.js

// API-Football Config
$API_FOOTBALL_KEY = 'c99171a5658ec12d1ff0e76b772e7275'; // From firebaseConfig.js
$API_FOOTBALL_HOST = 'v3.football.api-sports.io';

// Firestore Collection Name
$COLLECTION_NAME = 'matches';

// ========================================== 
// SECURITY CHECK
// ========================================== 

// Check if running from CLI or if the secret matches query param
$isCli = (php_sapi_name() === 'cli');
$secret = isset($_GET['secret']) ? $_GET['secret'] : '';

if (!$isCli && $secret !== $CRON_SECRET) {
    header('HTTP/1.1 403 Forbidden');
    die('Access Denied: Invalid Secret');
}

echo "Starting Sync Job...<br>\n";

// ========================================== 
// HELPER FUNCTIONS
// ========================================== 

/**
 * Converts a standard PHP array/object to Firestore JSON format
 */
function jsonToFirestore($data) {
    if (is_null($data)) {
        return ['nullValue' => null];
    }
    if (is_bool($data)) {
        return ['booleanValue' => $data];
    }
    if (is_int($data)) {
        return ['integerValue' => (string)$data];
    }
    if (is_float($data)) {
        return ['doubleValue' => $data];
    }
    if (is_string($data)) {
        return ['stringValue' => $data];
    }
    if (is_array($data)) {
        // Check if sequential array (list) or associative array (map)
        $isMap = false;
        if (empty($data)) {
            return ['arrayValue' => ['values' => []]];
        }
        if (array_keys($data) !== range(0, count($data) - 1)) {
            $isMap = true;
        }

        if ($isMap) {
            $fields = [];
            foreach ($data as $key => $value) {
                $fields[$key] = jsonToFirestore($value);
            }
            return ['mapValue' => ['fields' => $fields]];
        } else {
            $values = [];
            foreach ($data as $value) {
                $values[] = jsonToFirestore($value);
            }
            return ['arrayValue' => ['values' => $values]];
        }
    }
    return ['nullValue' => null];
}

/**
 * Fetch Data from API-Football
 */
function fetchFixtures($date) {
    global $API_FOOTBALL_KEY, $API_FOOTBALL_HOST;
    
    $url = "https://{$API_FOOTBALL_HOST}/fixtures?date={$date}";
    
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "x-rapidapi-host: {$API_FOOTBALL_HOST}",
            "x-rapidapi-key: {$API_FOOTBALL_KEY}"
        ],
    ]);
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
    
    if ($err) {
        echo "cURL Error fetching date {$date}: {$err}<br>\n";
        return [];
    }
    
    $json = json_decode($response, true);
    return $json['response'] ?? [];
}

/**
 * Batch Write to Firestore
 */
function batchWriteFirestore($writes) {
    global $FIREBASE_PROJECT_ID, $FIREBASE_API_KEY;

    if (empty($writes)) return;

    // Firestore REST API Batch Write Limit is 500. We will process in chunks of 450 to be safe.
    $chunks = array_chunk($writes, 450);

    foreach ($chunks as $chunk) {
        $url = "https://firestore.googleapis.com/v1/projects/{$FIREBASE_PROJECT_ID}/databases/(default)/documents:commit?key={$FIREBASE_API_KEY}";
        
        $body = json_encode(['writes' => $chunk]);
        
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json",
                // "Authorization: Bearer YOUR_OAUTH_TOKEN" // UNCOMMENT AND ADD TOKEN IF RULES REQUIRE AUTH
            ],
        ]);
        
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $err = curl_error($curl);
        curl_close($curl);
        
        if ($err) {
             echo "Firestore Write Error: {$err}<br>\n";
        } else {
             echo "Firestore Batch Write Status: {$httpCode}<br>\n";
             if ($httpCode >= 400) {
                 echo "Response: {$response}<br>\n";
             }
        }
    }
}

// ==========================================
// MAIN EXECUTION
// ==========================================

// Parse CLI Arguments
$options = getopt("", ["dry-run", "date::"]);
$dryRun = isset($options['dry-run']);
$customDate = isset($options['date']) ? $options['date'] : null;

if ($dryRun) {
    echo "--- DRY RUN MODE (No writes to Firestore) ---<br>\n";
}

// 1. Determine Dates to Fetch
if ($customDate) {
    $dates = [$customDate];
} else {
    // Default: Yesterday, Today, Tomorrow
    // NOTE: If API plan is free, this might fail for current years (e.g. 2026).
    // You might want to hardcode 2023 dates for testing if on a free plan.
    $dates = [
        date('Y-m-d', strtotime('-1 day')),
        date('Y-m-d'),
        date('Y-m-d', strtotime('+1 day'))
    ];
}

$allWrites = [];

foreach ($dates as $date) {
    echo "Fetching fixtures for {$date}...<br>\n";
    $fixtures = fetchFixtures($date);
    
    // Check for API errors in response (simple check)
    if (isset($fixtures['errors']) && !empty($fixtures['errors'])) {
        echo "API Error for {$date}: " . json_encode($fixtures['errors']) . "<br>\n";
        continue;
    }
    
    echo "Found " . count($fixtures) . " fixtures.<br>\n";
    
    foreach ($fixtures as $match) {
        $matchId = (string)$match['fixture']['id'];
        
        // Transform for Firestore
        $firestoreData = jsonToFirestore($match);
        
        // Create Write Operation
        $writeOp = [
            'update' => [
                'name' => "projects/{$FIREBASE_PROJECT_ID}/databases/(default)/documents/{$COLLECTION_NAME}/{$matchId}",
                'fields' => $firestoreData['mapValue']['fields']
            ]
        ];
        
        $allWrites[] = $writeOp;
    }
}

// 2. Send to Firestore
if ($dryRun) {
    echo "Dry Run: Would write " . count($allWrites) . " documents to Firestore.<br>\n";
    if (count($allWrites) > 0) {
        echo "Sample Document ID: " . basename($allWrites[0]['update']['name']) . "<br>\n";
    }
} else {
    echo "Writing " . count($allWrites) . " documents to Firestore...<br>\n";
    batchWriteFirestore($allWrites);
}

echo "Sync Completed.<br>\n";

?>
