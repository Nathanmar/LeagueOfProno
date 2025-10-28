/**
 * Export central des services API
 */

export { apiClient, realtimeClient } from "./api";
export { ApiClient, RealtimeClient } from "./api";

// Auth Service
export {
	registerUser,
	loginUser,
	getCurrentUser,
	logoutUser,
	type User,
	type AuthResponse,
	type CurrentUserResponse,
} from "./authService";

// Matches Service
export {
	getMatches,
	subscribeToMatches,
	submitPrediction,
	type Match,
	type MatchesResponse,
} from "./matchesService";

// Friends Service
export {
	getFriends,
	addFriend,
	removeFriend,
	type Friend,
	type FriendsResponse,
} from "./friendsService";

// Profile Service
export {
	getProfile,
	getUserProfile,
	updateProfile,
	type UserProfile,
	type ProfileResponse,
} from "./profileService";
