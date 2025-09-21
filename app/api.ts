import * as SecureStore from "expo-secure-store";

const API_BASE_URL = "http://192.168.254.132:5113/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ✅ Updated to exactly match your backend response
export interface PaymentNotice {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  userId: string;
  xenditPaymentLinkId?: string;
  xenditPaymentLinkUrl?: string;
  userId: string; // From your service
  status: number; // 0 = Pending, 1 = Paid, etc.
  createdAt: string;
  paidAt?: string | null;
}

// ✅ Helper function to convert backend status to display status
export const mapStatusToDisplay = (status: number): string => {
  switch (status) {
    case 0: return 'Pending';
    case 1: return 'Paid';
    case 2: return 'Failed';
    case 3: return 'Expired';
    default: return 'Unknown';
  }
};

export const apiClient = {
  getMyPaymentRequests: async (token: string): Promise<ApiResponse<PaymentNotice[]>> => {
    try {
      console.log('🔄 Fetching payment requests...');
      
      const response = await fetch(`${API_BASE_URL}/payment-notices/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Response status:', response.status);
      
      if (response.ok) {
        const rawData = await response.json();
        console.log('📦 Raw API response length:', Array.isArray(rawData) ? rawData.length : 'not array');
        console.log('📦 First item:', rawData[0]);
        
        // ✅ No mapping needed - your service already returns the right format
        const paymentNotices: PaymentNotice[] = Array.isArray(rawData) ? rawData : [];
        
        console.log('✅ Loaded', paymentNotices.length, 'payment requests');
        return { success: true, data: paymentNotices };
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        
        let error = 'Failed to load payments';
        try {
          const errorData = JSON.parse(errorText);
          error = errorData.message || errorData.error || error;
        } catch (e) {
          error = errorText.substring(0, 100);
        }
        
        return { success: false, error };
      }
    } catch (error: any) {
      console.error('🌐 Network error:', error);
      return { success: false, error: 'Network error: ' + error.message };
    }
  },

  getPaymentLink: async (noticeId: string, token: string): Promise<ApiResponse<{notice: PaymentNotice, paymentUrl: string}>> => {
    try {
      console.log('🔗 Getting payment link for notice:', noticeId);
      
      const response = await fetch(`${API_BASE_URL}/payment-notices/${noticeId}/pay`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('🔗 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔗 Payment response:', data);
        
        // ✅ Extract the payment URL from your existing XenditPaymentLinkUrl
        const paymentUrl = data.paymentUrl || data.xenditPaymentLinkUrl;
        const notice = data.notice;
        
        return { 
          success: true, 
          data: { 
            notice, 
            paymentUrl 
          } 
        };
      } else {
        const errorText = await response.text();
        console.error('🔗 Payment link error:', response.status, errorText);
        
        return { 
          success: false, 
          error: `Payment link failed: ${response.status}` 
        };
      }
    } catch (error: any) {
      console.error('🔗 Payment link network error:', error);
      return { success: false, error: 'Network error: ' + error.message };
    }
  },

  // Admin: Create payment notice
  createPaymentNotice: async (token: string, payload: CreateNoticePayload): Promise<ApiResponse<PaymentNotice>> => {
    try {
      console.log('➕ Creating payment notice:', payload);
      
      const response = await fetch(`${API_BASE_URL}/payment-notices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('➕ Payment notice created:', data);
        return { success: true, data };
      } else {
        const error = await response.json();
        console.error('➕ Create payment error:', error);
        return { success: false, error: error.message || 'Failed to create payment' };
      }
    } catch (error: any) {
      console.error('➕ Create payment network error:', error);
      return { success: false, error: 'Network error: ' + error.message };
    }
  },
};

export interface CreateNoticePayload {
  userId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
}
