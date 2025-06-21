"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  ExternalLink,
  Crown,
  Zap,
  Check,
  X,
} from "@/components/ui/icons";
import { formatDate, formatCurrency } from "@/lib/utils/format";

interface SubscriptionBillingProps {
  userId: string;
}

interface SubscriptionData {
  plan: {
    name: string;
    price: number;
    interval: string;
    features: string[];
  };
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: string;
  description: string;
  invoiceUrl?: string;
}

const PLAN_FEATURES = {
  inspiration: [
    "500 posts saved per month",
    "5 boards",
    "Basic analytics",
    "Email support",
  ],
  growth: [
    "Unlimited posts saved",
    "Unlimited boards & folders",
    "Advanced analytics",
    "Priority support",
    "Team collaboration",
    "Export data",
  ],
};

export function SubscriptionBilling({ userId }: SubscriptionBillingProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, [userId]);

  const loadSubscriptionData = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual Stripe subscription fetch
      // Mock data for now
      setSubscription({
        plan: {
          name: "Growth Plan",
          price: 19,
          interval: "month",
          features: PLAN_FEATURES.growth,
        },
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
      });

      setBillingHistory([
        {
          id: "inv_1",
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 19,
          status: "paid",
          description: "Growth Plan - Monthly",
          invoiceUrl: "#",
        },
        {
          id: "inv_2",
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 19,
          status: "paid",
          description: "Growth Plan - Monthly",
          invoiceUrl: "#",
        },
      ]);
    } catch (error) {
      console.error("Error loading subscription data:", error);
      toast.error("Failed to load subscription data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsUpdating(true);
    try {
      // TODO: Implement Stripe Customer Portal redirect
      toast.success("Redirecting to billing portal...");
      // window.open(customerPortalUrl, '_blank');
    } catch (error) {
      toast.error("Failed to open billing portal");
      console.error("Error opening billing portal:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsUpdating(true);
    try {
      // TODO: Implement subscription cancellation
      toast.success("Subscription will be cancelled at the end of the current period");
      if (subscription) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: true,
        });
      }
    } catch (error) {
      toast.error("Failed to cancel subscription");
      console.error("Error cancelling subscription:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsUpdating(true);
    try {
      // TODO: Implement subscription reactivation
      toast.success("Subscription reactivated successfully");
      if (subscription) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: false,
        });
      }
    } catch (error) {
      toast.error("Failed to reactivate subscription");
      console.error("Error reactivating subscription:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{subscription.plan.name}</h3>
                    <Badge 
                      variant={subscription.status === "active" ? "default" : 
                              subscription.status === "cancelled" ? "destructive" : "secondary"}
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(subscription.plan.price)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{subscription.plan.interval}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {subscription.cancelAtPeriodEnd ? (
                      <span>Expires on {formatDate(subscription.currentPeriodEnd)}</span>
                    ) : (
                      <span>Renews on {formatDate(subscription.currentPeriodEnd)}</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <Button
                    onClick={handleManageSubscription}
                    disabled={isUpdating}
                    className="mb-2"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Manage Subscription
                  </Button>
                  
                  {subscription.cancelAtPeriodEnd ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReactivateSubscription}
                      disabled={isUpdating}
                    >
                      Reactivate
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelSubscription}
                      disabled={isUpdating}
                    >
                      Cancel Plan
                    </Button>
                  )}
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-destructive mb-1">Subscription Cancelled</div>
                      <div className="text-muted-foreground">
                        Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. 
                        You&apos;ll continue to have access until then.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Plan Features */}
              <div className="space-y-3">
                <h4 className="font-medium">Plan Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {subscription.plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">
                Choose a plan to unlock premium features
              </p>
              <Button>
                <Zap className="w-4 h-4 mr-1" />
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242</div>
                  <div className="text-sm text-muted-foreground">Expires 12/25</div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Payment methods are managed through Stripe. Click &quot;Manage Subscription&quot; above to update your payment details.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billingHistory.length > 0 ? (
            <div className="space-y-4">
              {billingHistory.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">{invoice.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(invoice.date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                      <Badge variant="secondary" className="text-xs">
                        {invoice.status}
                      </Badge>
                    </div>
                    {invoice.invoiceUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Invoice
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No billing history available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inspiration Plan */}
            <div className="border rounded-lg p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Inspiration Plan</h3>
                <div className="text-2xl font-bold">$9<span className="text-sm font-normal">/month</span></div>
                <p className="text-sm text-muted-foreground mt-2">Perfect for getting started</p>
              </div>
              
              <div className="space-y-3 mb-6">
                {PLAN_FEATURES.inspiration.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full">
                Current Plan
              </Button>
            </div>

            {/* Growth Plan */}
            <div className="border rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Growth Plan</h3>
                <div className="text-2xl font-bold">$19<span className="text-sm font-normal">/month</span></div>
                <p className="text-sm text-muted-foreground mt-2">For serious content creators</p>
              </div>
              
              <div className="space-y-3 mb-6">
                {PLAN_FEATURES.growth.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full">
                <Crown className="w-4 h-4 mr-1" />
                Current Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 