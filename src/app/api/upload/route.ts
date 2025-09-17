
import 'dotenv/config';
import { auth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { headers } from 'next/headers';
import { getFirestore } from 'firebase-admin/firestore';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getAuthenticatedUserId(req: NextRequest): Promise<string> {
    const headersList = headers();
    const authorization = headersList.get('authorization');

    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            return decodedToken.uid;
        } catch (error) {
            console.error('Error verifying token:', error);
            throw new Error('Unauthorized: Invalid token');
        }
    }
    throw new Error('Unauthorized: No token provided');
}

export async function POST(req: NextRequest) {
  try {
    // Step 1: Get the authenticated user's ID locally on the server.
    const uid = await getAuthenticatedUserId(req);
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Step 2: Upload the image to Cloudinary.
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'habit-tracker-avatars',
      public_id: uid,
      overwrite: true,
      transformation: [
        {width: 200, height: 200, gravity: "face", crop: "thumb"}
      ]
    });

    // Step 3: If the upload is successful, get the download URL locally on the server.
    const secureUrl = uploadResponse.secure_url;
    
    // Step 4: After both previous functions work successfully, update the database field.
    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);
    await userRef.update({ avatarUrl: secureUrl });
    
    // Return the successful URL to the client.
    return NextResponse.json({ url: secureUrl });

  } catch (error: any) {
    console.error('Upload API error:', error);
    if(error.message.startsWith('Unauthorized')) {
       return NextResponse.json({ error: error.message }, { status: 401 });
    }
    // Check for Cloudinary-specific errors or other issues.
    const errorMessage = error.message || 'Something went wrong during the upload process.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
