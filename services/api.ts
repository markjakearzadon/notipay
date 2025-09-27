import * as SecureStore from "expo-secure-store";

const API_URL = "https://notipaygobackend-p5ko.onrender.com/api"; 

// ---------- Types ----------
export interface PaymentNotice {
    id: string;
    reference_id: string;
    payer_id: string;
    payee_id: string;
    amount: number;
    title: string;
    description?: string;
    status: "PENDING" | "PAID" | "FAILED";
    charge_id: string;
    disbursement_id?: string;
    checkout_url: string;
    created_at: string;
    updated_at: string;
}

export interface CreatePaymentNoticeDto {
    userId: string;
    title: string;
    description?: string;
    amount: number;
    currency: string | null;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        fullname: string;
        email: string;
        gcash_number: string;
        role: string;
        created_at: string;
    };
}

export interface UpdatePaymentStatusDto {
    status: number;
    paidAt?: string | null;
}

export interface RegisterRequest {
    userName: string;
    password: string;
    email?: string;
    phoneNumber?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Admin types
export interface UserAdminDto {
    id: string;
    userName?: string;
    email?: string;
    phoneNumber?: string;
    startSchoolYear?: number | null;
    isEligible?: boolean;
}

export interface SchoolYearDto {
    year: number;
    startDate: string; // ISO
}

export interface UpdateUserDto {
    startSchoolYear?: number | null;
    email?: string;
    phoneNumber?: string;
    role?: string;
}

export interface AppointmentDto {
    id: string;
    time: string;
    professorName: string;
    professorEmail?: string;
    studentName?: string;
    studentEmail?: string;
    description?: string;
    status?: string;
    createdAt?: string;
}

export interface UserEligibilityDto {
    userId: string;
    isEligible: boolean;
    startSchoolYear?: number | null;
    currentSchoolYear?: number | null;
    eligibilityMessage?: string;
}

// ---------- Secure store keys ----------
const ACCESS_TOKEN_KEY = "accessToken";

// ---------- Token storage helpers ----------
export const saveToken = async (token: string) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
};

export const clearToken = async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
};

export const getAccessToken = async (): Promise<string | null> => {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

// ---------- Low-level fetch with auth ----------
async function fetchWithAuth(path: string, opts: RequestInit = {}): Promise<Response> {
    const accessToken = await getAccessToken();
    const headers = new Headers(opts.headers ?? {});
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    headers.set("Content-Type", "application/json");

    return fetch(`${API_URL}${path}`, { ...opts, headers });
}

// ---------- Auth endpoints ----------
export const authApi = {
    login: async (req: LoginRequest): Promise<LoginResponse> => {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req), // now sends { email, password }
        });


         if (!res.ok) {
             const txt = await res.text();
            try {
                const json = JSON.parse(txt);
                throw new Error(json.error ?? json.message ?? txt);
            } catch {
                throw new Error(txt || "Login failed");
            }
        }

        const body: LoginResponse = await res.json();
        await saveToken(body.token);
        return body;
    },

    register: async (req: RegisterRequest): Promise<{ success: boolean; userId?: string }> => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || "Register failed");
        }

        const json = await res.json();
        return json;
    },

    logout: async (): Promise<void> => {
        try {
            const token = await getAccessToken();
            if (token) {
                await fetch(`${API_URL}/auth/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch {}
        await clearToken();
    },
};

// ---------- User endpoints ----------
export const userApi = {
    getAllUsers: async (): Promise<UserAdminDto[]> => {
        const res = await fetchWithAuth("/auth/users", { method: "GET" });
        if (!res.ok) throw new Error(await res.text() || "Failed to fetch users");
        const json = await res.json();
        return json.data ?? json;
    },

    getAdminUsers: async (): Promise<UserAdminDto[]> => {
        const res = await fetchWithAuth("/admin/users", { method: "GET" });
        if (!res.ok) throw new Error(await res.text() || "Failed to fetch admin users");
        const json = await res.json();
        return json.data ?? json;
    },

    updateUser: async (id: string, dto: UpdateUserDto): Promise<boolean> => {
        const res = await fetchWithAuth(`/admin/users/${id}`, {
            method: "PUT",
            body: JSON.stringify(dto),
        });
        if (!res.ok) throw new Error(await res.text() || "Failed to update user");
        return true;
    },

    getUserEligibility: async (userId: string): Promise<UserEligibilityDto> => {
        const res = await fetchWithAuth(`/admin/users/${userId}/eligibility`, { method: "GET" });
        if (!res.ok) throw new Error(await res.text() || "Failed to fetch eligibility");
        const json = await res.json();
        return json.data ?? json;
    },
};

// ---------- Admin endpoints ----------
export const adminApi = {
    getSchoolYears: async (): Promise<SchoolYearDto[]> => {
        const res = await fetchWithAuth("/admin/schoolyears", { method: "GET" });
        if (!res.ok) throw new Error(await res.text() || "Failed to fetch school years");
        const json = await res.json();
        return json.data ?? json;
    },

    setSchoolYear: async (dto: SchoolYearDto): Promise<boolean> => {
        const res = await fetchWithAuth("/admin/schoolyears", {
            method: "POST",
            body: JSON.stringify(dto),
        });
        if (!res.ok) throw new Error(await res.text() || "Failed to set school year");
        return true;
    },

    getCurrentSchoolYear: async (): Promise<SchoolYearDto | null> => {
        const res = await fetchWithAuth("/admin/schoolyears/current", { method: "GET" });
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(await res.text() || "Failed to fetch current school year");
        }
        const json = await res.json();
        return json.data ?? json;
    },

    getAppointments: async (startDate?: string, endDate?: string): Promise<AppointmentDto[]> => {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        const path = `/admin/appointments${params.toString() ? "?" + params.toString() : ""}`;
        const res = await fetchWithAuth(path, { method: "GET" });
        if (!res.ok) throw new Error(await res.text() || "Failed to fetch appointments");
        const json = await res.json();
        return json.data ?? json;
    },
};

// ---------- Payment Notice endpoints ----------
export const paymentNoticeApi = {
    getMyPaymentRequests: async (userId: string): Promise<PaymentNotice[]> => {
        if (!userId) throw new Error("User ID is required");
        const res = await fetchWithAuth(`/userid/${userId}/payments`, { method: "GET" });
        if (!res.ok) throw new Error(await res.text() || "Failed to fetch payment requests");
        const json = await res.json();
        return json.data ?? json;
    },

    updatePaymentStatus: async (id: string, dto: UpdatePaymentStatusDto): Promise<ApiResponse> => {
        const res = await fetchWithAuth(`/payment-notices/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify(dto),
        });
        if (!res.ok) throw new Error(await res.text() || "Failed to update payment status");
        const json = await res.json();
        return json.data ?? json;
    },

    getMyUnpaidDues: async (userId: string): Promise<PaymentNotice[]> => {
        if (!userId) throw new Error("User ID is required");
        const res = await fetchWithAuth(`/api/userid/${userId}/unpaid`, { method: "GET" });
        if (!res.ok) throw new Error(await res.text() || "Failed to fetch unpaid dues");
        const json = await res.json();
        return json.data ?? json;
    },
    
    createPaymentNotice: async (dto: CreatePaymentNoticeDto): Promise<PaymentNotice> => {
        const res = await fetchWithAuth("/payment-notices", {
            method: "POST",
            body: JSON.stringify(dto),
        });
        if (!res.ok) throw new Error(await res.text() || "Failed to create payment notice");
        const json = await res.json();
        return json.data ?? json;
    },
    // Add to paymentNoticeApi in api.ts
    getAllPayments: async (status?: "PENDING" | "PAID"): Promise<PaymentNotice[]> => {
      const params = new URLSearchParams();
      if (status) params.append("status", status === "PAID" ? "SUCCEEDED" : "PENDING");
      const path = `/payments${params.toString() ? "?" + params.toString() : ""}`;
      const res = await fetchWithAuth(path, { method: "GET" });
      if (!res.ok) throw new Error(await res.text() || "Failed to fetch payments");
      const json = await res.json();
      // Map backend status (SUCCEEDED -> PAID)
      return (json.data ?? json).map((payment: PaymentNotice) => ({
          ...payment,
          status: payment.status === "SUCCEEDED" ? "PAID" : payment.status,
      }));
    },
};

// ---------- Helpers ----------
export const mapStatusToDisplay = (status: string): string => {
    switch (status.toUpperCase()) {
        case "PENDING": return "Pending";
        case "PAID": return "Paid";
        case "FAILED": return "Failed";
        default: return "Unknown";
    }
};

// Force logout
export const forceLogout = async () => {
    await clearToken();
};

export default {
    authApi,
    userApi,
    adminApi,
    paymentNoticeApi,
    saveToken,
    getAccessToken,
    clearToken,
    forceLogout,
};
