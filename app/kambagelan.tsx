import { useRouter } from "expo-router";
import { Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";

const TermsAndPrivacy = () => {
  const router = useRouter();
  
  return (
    <SafeAreaView className="h-full w-screen bg-white flex-1 p-4">
      <ScrollView className="flex-1">
        <Text className="text-black text-2xl font-bold mb-4">
          Notipay Terms of Service and Privacy Policy
        </Text>
        
        <Text className="text-black text-lg font-semibold mb-2">
          Terms of Service
        </Text>
        <Text className="text-black text-base mb-4">
          Welcome to Notipay, a payment processing application currently operating in test mode using the Xendit SDK. By using Notipay, you agree to these Terms of Service.
          
          {'\n\n'}1. **Service Description**: Notipay is a test-mode payment processing platform utilizing Xendit's SDK for simulated transactions. No real financial transactions occur in this mode.
          
          {'\n'}2. **Usage**: The app is provided for testing and evaluation purposes only. You agree not to use Notipay for any real-world financial transactions while in test mode.
          
          {'\n'}3. **User Responsibilities**: You are responsible for maintaining the confidentiality of any test credentials provided and for all activities conducted through your account.
          
          {'\n'}4. **Limitation of Liability**: Notipay and its developers are not liable for any damages or losses arising from the use of this test-mode application.
          
          {'\n'}5. **Changes to Terms**: We may update these terms periodically. Continued use of Notipay constitutes acceptance of the updated terms.
        </Text>
        
        <Text className="text-black text-lg font-semibold mb-2">
          Privacy Policy
        </Text>
        <Text className="text-black text-base mb-8">
          At Notipay, we value your privacy. This Privacy Policy outlines how we handle your information in test mode.
          
          {'\n\n'}1. **Data Collection**: In test mode, Notipay collects minimal data, including temporary test transaction details and user inputs required for Xendit SDK functionality. No real personal or financial information is collected.
          
          {'\n'}2. **Data Usage**: Collected test data is used solely to simulate payment processing and improve the app's functionality. It is not shared with third parties, except as required by Xendit for SDK operation.
          
          {'\n'}3. **Data Storage**: Test data is stored temporarily and securely during your session. Data is not retained after the session ends.
          
          {'\n'}4. **Cookies and Tracking**: Notipay in test mode does not use cookies or tracking technologies.
          
          {'\n'}5. **Contact Us**: For questions about this Privacy Policy, contact our support team at support@notipay.com.
        </Text>
        
        <TouchableOpacity 
          onPress={() => router.push("/")} 
          className="bg-blue-500 p-4 rounded-lg mb-4"
        >
          <Text className="text-white text-center text-lg font-semibold">
            Back to Home
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsAndPrivacy;
