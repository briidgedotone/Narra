import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <XCircle className="mx-auto h-16 w-16 text-gray-400" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Payment Cancelled
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your payment was cancelled. No charges were made to your account.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Need help choosing a plan?
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Our plans are designed to help content creators and marketers
            discover viral content and grow their audience.
          </p>
          <ul className="text-left space-y-2 text-sm text-gray-600">
            <li>• Start with a 3-day free trial</li>
            <li>• Cancel anytime</li>
            <li>• 24/7 dedicated support</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/select-plan"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
