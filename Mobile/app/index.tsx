import { Redirect } from 'expo-router';

/** Always start at the login screen on every fresh load. */
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
