import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Next.js standard way to parse multipart/form-data for file uploads
    const formData = await req.formData();
    const rider_id = formData.get('rider_id')?.toString();
    const screenshot = formData.get('screenshot') as File | null;
    const requestedAmount = 1000; // Fixed 'Weekly Pass' top-up amount

    if (!rider_id || !screenshot) {
      return NextResponse.json(
        { error: 'Both rider_id and a valid bank transfer screenshot are required' }, 
        { status: 400 }
      );
    }

    // 1. Process the File Upload
    // Convert the file to a buffer if storing locally or piping to a cloud bucket
    const bytes = await screenshot.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Example Cloud Upload:
    // const uploadUrl = await uploadToCloudStorage(buffer, screenshot.name, 'image/jpeg');
    const mockUploadUrl = `https://your-s3-bucket.aws.com/receipts/${Date.now()}_${screenshot.name}`;

    // 2. Log exactly what we are processing for the admin to review
    // ==========================================
    // Production DB Query:
    // In real scenarios, you DO NOT immediately top up the wallet balance. 
    // You insert a "pending" transaction that an admin later verifies and approves.
    //
    // await db.query(`
    //   INSERT INTO wallet_transactions (rider_id, amount, screenshot_url, type, status)
    //   VALUES ($1, $2, $3, 'top_up', 'pending')
    // `, [rider_id, requestedAmount, mockUploadUrl]);
    // ==========================================

    return NextResponse.json({
      success: true,
      message: `Top-up request for ${requestedAmount} LKR submitted successfully! Your balance will be updated once the admin verifies the screenshot.`,
      uploaded_file: mockUploadUrl
    });

  } catch (error) {
    console.error('Top-Up Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
