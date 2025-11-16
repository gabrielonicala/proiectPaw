import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendEmail, createAccountDeletionConfirmationEmail } from '@/lib/email-resend';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;

    // Get user data before deletion (for email)
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        username: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Send confirmation email before deletion
    try {
      const { html, text } = createAccountDeletionConfirmationEmail(
        user.name || user.username || 'adventurer',
        user.email || ''
      );

      await sendEmail({
        to: user.email || '',
        subject: 'Account Deleted - Quillia',
        html,
        text,
      });
    } catch (emailError) {
      console.error('Failed to send account deletion confirmation email:', emailError);
      // Continue with deletion even if email fails
    }

    // Delete the user (this will cascade delete characters, entries, etc. due to Prisma schema)
    await db.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Account deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

