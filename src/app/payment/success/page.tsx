import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Payment Successful!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your subscription has been activated successfully.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            What&apos;s next?
          </h2>
          <ul className="text-left space-y-2 text-sm text-gray-600">
            <li>• Start discovering viral content</li>
            <li>• Follow your favorite creators</li>
            <li>• Organize content into boards</li>
            <li>• Access detailed analytics</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/discovery"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Start Discovering Content
          </Link>
        </div>
      </div>
    </div>
  );
}
