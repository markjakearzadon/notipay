// services/api.ts
import * as SecureStore from "expo-secure-store";

const API_URL = "http://10.239.1.175:5113/api"; 

// ---------- Types ----------
export interface PaymentNotice {
    id: string;
    title: string;
    description?: string;
    amount: number;
    currency: string;
    status: number;
    createdAt: string;
    paidAt?: string | null;
    xenditPaymentLinkUrl?: string;
}

export interface LoginRequest {
    userName: string;
    password: string;
}

export interface RegisterRequest {
    userName: string;
    password: string;
    email?: string;
    phoneNumber?: string;
}

export interface TokenResponseDto {
    accessToken: string;
    refreshToken: string;
    role: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// DTOs for admin endpoints (simple versions — expand as needed)
export interface UserAdminDto {
    id: string;
    userName: string;
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
const REFRESH_TOKEN_KEY = "refreshToken";

// ---------- Token storage helpers ----------
export const saveTokens = async (tokens: TokenResponseDto) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
};

export const clearTokens = async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

export const getAccessToken = async (): Promise<string | null> => {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = async (): Promise<string | null> => {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

// ---------- Low-level fetch with automatic refresh ----------
/**
 * Attempts the request with the stored access token.
 * If a 401 is returned, it tries refresh and retries the original request once.
 */
async function fetchWithAuth(
    path: string,
    opts: RequestInit = {},
    attemptRefresh = true
): Promise<Response> {
    const accessToken = await getAccessToken();
    const headers = new Headers(opts.headers ?? {});
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    headers.set("Content-Type", "application/json");

    const response = await fetch(`${API_URL}${path}`, { ...opts, headers });

    if (response.status === 401 && attemptRefresh) {
	// Try to refresh tokens
	const refreshed = await tryRefreshToken();
	if (refreshed) {
	    // Retry original request once
	    return fetchWithAuth(path, opts, false);
	}
    }

    return response;
}

/**
 * Call refresh endpoint using stored refresh token.
 * On success, saves new tokens and returns true.
 *
 * NOTE: adjust endpoint path (/auth/refresh) and request/response format to match your backend.
 */
async function tryRefreshToken(): Promise<boolean> {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return false;

    try {
	const res = await fetch(`${API_URL}/auth/refresh`, {
	    method: "POST",
	    headers: { "Content-Type": "application/json" },
	    body: JSON.stringify({ refreshToken }),
	});

	if (!res.ok) return false;
	const json = await res.json();
	// Expecting response: { accessToken, refreshToken, role } or { success: true, data: { ... } }
	const candidate: TokenResponseDto | { success: boolean; data?: TokenResponseDto } = json;

	let tokens: TokenResponseDto | undefined;
	if ("accessToken" in candidate) tokens = candidate as TokenResponseDto;
	else if (candidate && (candidate as any).success && (candidate as any).data)
	    tokens = (candidate as any).data as TokenResponseDto;

	if (!tokens) return false;

	await saveTokens(tokens);
	return true;
    } catch (err) {
	console.warn("Refresh token failed:", err);
	return false;
    }
}

// ---------- Auth endpoints ----------
export const authApi = {
    login: async (req: LoginRequest): Promise<TokenResponseDto> => {
	const res = await fetch(`${API_URL}/Auth/login`, {
	    method: "POST",
	    headers: { "Content-Type": "application/json" },
	    body: JSON.stringify(req),
	});

	if (!res.ok) {
	    // try to parse error body
	    const txt = await res.text();
	    try {
		const json = JSON.parse(txt);
		const err = (json as any).error ?? (json as any).message ?? txt;
		throw new Error(err);
	    } catch {
		throw new Error(txt || "Login failed");
	    }
	}

	const body = await res.json();

	// Your backend returns: { success: true, data: { AccessToken, RefreshToken, Role } }
	// or directly { accessToken, refreshToken, role }
	let tokens: TokenResponseDto;
	if (body && body.data) {
	    tokens = {
		accessToken: body.data.accessToken ?? body.data.AccessToken,
		refreshToken: body.data.refreshToken ?? body.data.RefreshToken,
		role: body.data.role ?? body.data.Role,
	    };
	} else {
	    tokens = {
		accessToken: body.accessToken ?? body.AccessToken,
		refreshToken: body.refreshToken ?? body.RefreshToken,
		role: body.role ?? body.Role,
	    };
	}

	// persist tokens
	await saveTokens(tokens);
	return tokens;
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

	// Expect either user object or minimal response
	const json = await res.json();
	return json;
    },

    logout: async (): Promise<void> => {
	// Optionally call backend logout endpoint to invalidate refresh tokens
	try {
	    await fetchWithAuth("/auth/logout", { method: "POST" });
	} catch (e) {
	    // ignore
	} finally {
	    await clearTokens();
	}
    },
};

// ---------- Admin & other endpoints ----------

export const userApi = {
    // get all professors (non-admin)
    getAllUsers: async (): Promise<UserAdminDto[]> => {
	const res = await fetchWithAuth("/auth/users", { method: "GET" });
	if (!res.ok) {
	    const txt = await res.text();
	    throw new Error(txt || "Failed to fetch users");
	}
	const json = await res.json();
	// If backend wraps with { success:true, data: [...] }
	return json.data ?? json;
    },

    // admin view with eligibility info
    getAdminUsers: async (): Promise<UserAdminDto[]> => {
	const res = await fetchWithAuth("/admin/users", { method: "GET" });
	if (!res.ok) {
	    const txt = await res.text();
	    throw new Error(txt || "Failed to fetch admin users");
	}
	const json = await res.json();
	return json.data ?? json;
    },

    updateUser: async (id: string, dto: UpdateUserDto): Promise<boolean> => {
	const res = await fetchWithAuth(`/admin/users/${id}`, {
	    method: "PUT",
	    body: JSON.stringify(dto),
	});
	if (!res.ok) {
	    const txt = await res.text();
	    throw new Error(txt || "Failed to update user");
	}
	return true;
    },

    getUserEligibility: async (userId: string): Promise<UserEligibilityDto> => {
	const res = await fetchWithAuth(`/admin/users/${userId}/eligibility`, { method: "GET" });
	if (!res.ok) {
	    const txt = await res.text();
	    throw new Error(txt || "Failed to fetch eligibility");
	}
	const json = await res.json();
	return json.data ?? json;
    },
};

export const adminApi = {
    getSchoolYears: async (): Promise<SchoolYearDto[]> => {
	const res = await fetchWithAuth("/admin/schoolyears", { method: "GET" });
	if (!res.ok) {
	    const txt = await res.text();
	    throw new Error(txt || "Failed to fetch school years");
	}
	const json = await res.json();
	return json.data ?? json;
    },

    setSchoolYear: async (dto: SchoolYearDto): Promise<boolean> => {
	const res = await fetchWithAuth("/admin/schoolyears", {
	    method: "POST",
	    body: JSON.stringify(dto),
	});
	if (!res.ok) {
	    const txt = await res.text();
	    throw new Error(txt || "Failed to set school year");
	}
	return true;
    },

    getCurrentSchoolYear: async (): Promise<SchoolYearDto | null> => {
	const res = await fetchWithAuth("/admin/schoolyears/current", { method: "GET" });
	if (!res.ok) {
	    if (res.status === 404) return null;
	    const txt = await res.text();
	    throw new Error(txt || "Failed to fetch current school year");
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
	if (!res.ok) {
	    const txt = await res.text();
	    throw new Error(txt || "Failed to fetch appointments");
	}
	const json = await res.json();
	return json.data ?? json;
    },
};

export const paymentNoticeApi = {
    getMyPaymentRequests: async (): Promise<PaymentNotice[]> => {
        const res = await fetchWithAuth("/payment-notices/my-requests", { method: "GET" });
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || "Failed to fetch payment requests");
        }
        const json = await res.json();
        return json.data ?? json; // handle both wrapped and plain responses
    },
};

// Helper function to convert backend status to display status
export const mapStatusToDisplay = (status: number): string => {
  switch (status) {
    case 0: return 'Pending';
    case 1: return 'Paid';
    case 2: return 'Failed';
    case 3: return 'Expired';
    default: return 'Unknown';
  }
};

// ---------- Convenience: clear stored tokens on critical auth error ----------
/**
 * Call this when you detect the user should be logged out (invalid refresh, 403, etc.)
 */
export const forceLogout = async () => {
    await clearTokens();
    // optionally call backend logout or notify UI to navigate to login
};

// ---------- Usage notes ----------
/*
   - Replace API_URL with your actual host (e.g. http://10.0.2.2:5000/api for Android emulator).
   - Confirm backend routes:
   POST /auth/login          -> login
   POST /auth/register       -> register
   POST /auth/refresh        -> refresh tokens (expects { refreshToken })
   POST /auth/logout         -> optional logout/invalidate refresh token
   GET  /auth/users          -> get all non-admin users
   GET  /admin/users         -> admin users with eligibility
   PUT  /admin/users/{id}    -> update user
   GET  /admin/schoolyears   -> list school years
   POST /admin/schoolyears   -> add/update school year
   GET  /admin/schoolyears/current -> current school year
   GET  /admin/appointments  -> list appointments
   - If your backend returns different route names or response shapes, adjust code parsing accordingly.
   - In components, call authApi.login(...) and then check returned role before navigating.
   - For sensitive token storage we used expo-secure-store. Ensure you `expo install expo-secure-store`.
 */

export default {
    authApi,
    userApi,
    adminApi,
    saveTokens,
    getAccessToken,
    getRefreshToken,
    clearTokens,
    forceLogout,
    paymentNoticeApi,
};
