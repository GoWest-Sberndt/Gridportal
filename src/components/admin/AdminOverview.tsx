import React from "react";
import { Users, Award, FileText, Zap, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tier: string;
  spark_points: number;
  created_at: string;
  last_login: string;
  is_active: boolean;
  profile_image_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  upline_id?: string;
  selected_badges?: string[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  tier: string;
  requirements: any;
  is_active: boolean;
  created_at: string;
}

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  user_id: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  assigned_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface SparkPointsTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: string;
  description: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface AdminOverviewProps {
  users: User[];
  badges: Badge[];
  tickets: Ticket[];
  sparkPointsTransactions: SparkPointsTransaction[];
}

const AdminOverview: React.FC<AdminOverviewProps> = ({
  users,
  badges,
  tickets,
  sparkPointsTransactions,
}) => {
  return (
    <div className="space-y-6 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Badges</p>
                <p className="text-3xl font-bold text-gray-900">{badges.filter(b => b.is_active).length}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-3xl font-bold text-gray-900">{tickets.filter(t => t.status === "open").length}</p>
              </div>
              <FileText className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Spark Points Issued</p>
                <p className="text-3xl font-bold text-gray-900">
                  {sparkPointsTransactions.reduce((sum, t) => sum + (t.points > 0 ? t.points : 0), 0)}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sparkPointsTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.user?.first_name} {transaction.user?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Database</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Authentication</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Info className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Last Backup</span>
                </div>
                <span className="text-sm text-blue-700">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;