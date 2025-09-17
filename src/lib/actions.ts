
'use server';

import { getUserId, updateUser } from "./data";

export async function updateUserAvatar(avatarUrl: string) {
    const uid = getUserId();
    if (!uid) {
        throw new Error("User not authenticated");
    }
    await updateUser({ avatarUrl });
}
