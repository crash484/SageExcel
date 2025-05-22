export default function Dashboard() {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to your Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stats cards */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-indigo-800">Files Uploaded</h3>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">0</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-green-800">Analyses Performed</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">0</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-purple-800">Saved Charts</h3>
                    <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-500">No recent activity</p>
                </div>
            </div>
        </div>
    )
}