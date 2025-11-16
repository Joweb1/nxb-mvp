import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONT_FAMILY, SIZES, BORDER_RADIUS } from '../../constants/theme';
import { mapFirebaseAuthError } from '../../utils/firebaseErrors';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signUp(email, password);
      router.replace('/home');
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
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Start your journey with us</Text>

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
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor={COLORS.text}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        onFocus={onInputFocus}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/login" asChild>
          <Pressable>
            <Text style={styles.link}>Sign In</Text>
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
