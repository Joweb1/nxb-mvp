import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONT_FAMILY, SIZES, BORDER_RADIUS } from '../../constants/theme';
import { mapFirebaseAuthError } from '../../utils/firebaseErrors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      router.replace('/highlight');
    } catch (error) {
      setError(mapFirebaseAuthError(error.code));
    } finally {
      setLoading(false);
    }
  };

  const onInputFocus = () => {
    setError('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={COLORS.text}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        onFocus={onInputFocus}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={COLORS.text}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        onFocus={onInputFocus}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Link href="/signup" asChild>
          <Pressable>
            <Text style={styles.link}>Sign Up</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: SIZES.h1,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: SIZES.h3,
    fontFamily: FONT_FAMILY.primary,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  input: {
    height: 50,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SIZES.padding,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.primary,
    fontSize: SIZES.body,
    marginBottom: SIZES.base * 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorText: {
    color: COLORS.error,
    fontFamily: FONT_FAMILY.primary,
    textAlign: 'center',
    marginBottom: SIZES.base * 2,
  },
  button: {
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.base * 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: FONT_FAMILY.bold,
    fontSize: SIZES.h3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.padding,
  },
  footerText: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.primary,
  },
  link: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
  },
});
