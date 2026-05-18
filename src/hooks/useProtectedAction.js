import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../utils/AuthContext';

/**
 * Hook to enforce authentication before performing an action.
 * Returns a `requireAuth` wrapper function.
 */
export function useProtectedAction() {
  const { isLoggedIn } = useAuth();
  const navigation = useNavigation();

  const requireAuth = (action) => {
    if (isLoggedIn) {
      action();
    } else {
      Alert.alert(
        "Login Required",
        "Please login to continue using this feature.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Login", 
            onPress: () => navigation.navigate("Login") 
          }
        ]
      );
    }
  };

  return requireAuth;
}
