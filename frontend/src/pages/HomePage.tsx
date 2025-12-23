import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiClient.get('/health');
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">欢迎</h2>
        <p className="mt-2 text-gray-600">
          这是 AI 辅助办公软件的前端应用
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">后端连接状态</h3>
        {isLoading && <p className="text-gray-500">检查中...</p>}
        {error && (
          <p className="text-red-600">
            无法连接到后端服务: {error.message}
          </p>
        )}
        {data && (
          <div className="text-green-600">
            <p>✅ 后端服务正常</p>
            <p className="text-sm text-gray-500 mt-2">
              时间戳: {data.timestamp}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

