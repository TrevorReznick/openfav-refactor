import React, { useState } from 'react';
import { sites, collections, lists } from '@/api/apiClient';
import type { ApiResponse, LinkFormData, CollectionFormData, CreateListData } from '@/types/api';

type QueryType = 'sites' | 'collections' | 'lists';

interface ApiExample {
    name: string;
    type: QueryType;
    action: string;
    body?: string;
}

interface RequestHistoryItem {
    timestamp: string;
    method: string;
    endpoint: string;
    status: number;
    responseTime: string;
    request: string;
    response: ApiResponse<any>;
}

const apiExamples: ApiExample[] = [
    {
        name: 'Get All Sites',
        type: 'sites',
        action: 'getAll',
    },
    {
        name: 'Create New Site',
        type: 'sites',
        action: 'create',
        body: JSON.stringify({
            title: 'Test Site',
            url: 'https://example.com ',
            description: 'Test site created via API',
            context_id: '1',
            resource_id: '1',
            function_id: '1',
        }, null, 2),
    },
    // Aggiungi altri esempi per collections e lists...
];

const ApiTestComponent: React.FC = () => {
    const [type, setType] = useState<QueryType>('sites');
    const [action, setAction] = useState<string>('getAll');
    const [body, setBody] = useState<string>('');
    const [responseData, setResponseData] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [requestHistory, setRequestHistory] = useState<RequestHistoryItem[]>([]);
    const [activeTab, setActiveTab] = useState<string>('examples');
    const [consoleOutput, setConsoleOutput] = useState<string>('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setResponseData('');
        try {
            const startTime = performance.now();
            let response: ApiResponse<any> | undefined = undefined;

            switch (type) {
                case 'sites':
                    if (action === 'getAll') response = await sites.getAll();
                    else if (action === 'getOne') response = await sites.getOne(body);
                    else if (action === 'create') response = await sites.create(JSON.parse(body) as LinkFormData);
                    break;
                case 'collections':
                    if (action === 'getAll') response = await collections.getAll();
                    else if (action === 'getOne') response = await collections.getOne(body);
                    else if (action === 'create') response = await collections.create(JSON.parse(body) as CollectionFormData);
                    break;
                case 'lists':
                    if (action === 'getAll') response = await lists.getAll();
                    else if (action === 'getOne') response = await lists.getOne(parseInt(body));
                    else if (action === 'create') response = await lists.create(JSON.parse(body) as CreateListData);
                    break;
            }

            if (!response) throw new Error('No response received from API');

            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            setResponseData(JSON.stringify(response, null, 2));

            setRequestHistory([
                {
                    timestamp: new Date().toLocaleTimeString(),
                    method: action === 'getAll' ? 'GET' : action === 'getOne' ? 'GET' : 'POST',
                    endpoint: `${type}/${action}`,
                    status: response.status || 0,
                    responseTime: `${responseTime}ms`,
                    request: body,
                    response: response,
                },
                ...requestHistory.slice(0, 9),
            ]);

            setConsoleOutput(prev =>
                `${prev}\n[${new Date().toLocaleTimeString()}] ${JSON.stringify(response, null, 2)}`
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            console.error('API Error:', err);
            setConsoleOutput(prev =>
                `${prev}\n[${new Date().toLocaleTimeString()}] Error: ${errorMessage}`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleExampleClick = (example: ApiExample) => {
        setType(example.type);
        setAction(example.action);
        setBody(example.body || '');
        setActiveTab('console');
    };

    return (
        <div className="p-6 w-full mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">API Test Console</h2>

            {/* Examples Buttons */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Examples</h3>
                <div className="flex flex-wrap gap-2">
                    {apiExamples.map((example, index) => (
                        <button
                            key={index}
                            onClick={() => handleExampleClick(example)}
                            className="px-4 py-2 bg-white hover:bg-blue-50 text-gray-800 rounded border border-gray-200 transition-colors whitespace-nowrap"
                        >
                            {example.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Console Panel */}
            <div className="w-full">
                <div className="bg-gray-800 text-white p-4 rounded-t-lg">
                    <div className="flex space-x-4 mb-4">
                        <button
                            className={`px-4 py-2 rounded ${activeTab === 'console' ? 'bg-blue-600' : 'bg-gray-700'}`}
                            onClick={() => setActiveTab('console')}
                        >
                            Console
                        </button>
                        <button
                            className={`px-4 py-2 rounded ${activeTab === 'history' ? 'bg-blue-600' : 'bg-gray-700'}`}
                            onClick={() => setActiveTab('history')}
                        >
                            History
                        </button>
                    </div>
                </div>
                {activeTab === 'console' ? (
                    <div className="bg-gray-900 text-green-400 p-4 rounded-b-lg font-mono text-sm overflow-auto max-h-96">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as QueryType)}
                                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                                >
                                    <option value="sites">Sites</option>
                                    <option value="collections">Collections</option>
                                    <option value="lists">Lists</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Action</label>
                                <select
                                    value={action}
                                    onChange={(e) => setAction(e.target.value)}
                                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                                >
                                    <option value="getAll">Get All</option>
                                    <option value="getOne">Get One</option>
                                    <option value="create">Create</option>
                                </select>
                            </div>
                            {(action === 'getOne' || action === 'create') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        {action === 'getOne' ? 'ID' : 'JSON Body'}
                                    </label>
                                    <textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white font-mono text-sm h-32"
                                        placeholder={action === 'getOne' ? 'Enter ID' : 'Enter JSON body'}
                                    />
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-2 px-4 rounded ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium`}
                            >
                                {loading ? 'Sending...' : 'Send Request'}
                            </button>
                        </form>
                        {error && (
                            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}
                        {responseData && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Response:</h4>
                                <pre className="bg-gray-800 p-3 rounded overflow-auto max-h-64">
                                    {responseData}
                                </pre>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-900 text-green-400 p-4 rounded-b-lg font-mono text-sm overflow-auto max-h-96">
                        {requestHistory.length === 0 ? (
                            <p className="text-gray-500">No request history yet</p>
                        ) : (
                            <div className="space-y-4">
                                {requestHistory.map((item, index) => (
                                    <div key={index} className="border-b border-gray-700 pb-4 mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold">
                                                {item.method} {item.endpoint} - {item.status}
                                            </span>
                                            <span className="text-xs text-gray-500">{item.timestamp} ({item.responseTime})</span>
                                        </div>
                                        <div className="text-xs text-gray-400 mb-2">
                                            <div className="font-semibold">Request:</div>
                                            <pre className="whitespace-pre-wrap break-words">{item.request || 'No request body'}</pre>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            <div className="font-semibold">Response:</div>
                                            <pre className="whitespace-pre-wrap break-words">
                                                {JSON.stringify(item.response, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Console Output */}
            <div className="mt-6 bg-gray-100 p-4 rounded-lg w-full">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Console Output</h3>
                <pre className="bg-black text-green-400 p-3 rounded font-mono text-sm overflow-auto max-h-48 w-full">
                    {consoleOutput || '// Console output will appear here...'}
                </pre>
            </div>
        </div>
    );
};

export default ApiTestComponent;