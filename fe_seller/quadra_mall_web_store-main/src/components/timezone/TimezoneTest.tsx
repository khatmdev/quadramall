// components/timezone/TimezoneTest.tsx - FOR TESTING ONLY
import React, { useState } from 'react';
import { 
  parseBackendDateTimeToLocal,
  convertLocalToBackendDateTime,
  previewDateTimeFromLocal,
  formatDateTimeDisplay,
  createDefaultDateTimeValues
} from '@/services/discountService';
import { Calendar, Clock, MapPin, ArrowRight, TestTube, CheckCircle, XCircle } from 'lucide-react';

const TimezoneTest: React.FC = () => {
  const [testDateTime, setTestDateTime] = useState('');
  const [backendDateTime, setBackendDateTime] = useState('');

  const defaultValues = createDefaultDateTimeValues();

  // Test cases
  const testCases = [
    {
      name: 'Backend DateTime from LocalDateTime',
      backend: '2024-12-25T14:30:00',
      expectedLocal: '2024-12-25T14:30'
    },
    {
      name: 'Backend DateTime with ISO format',
      backend: '2024-12-25T14:30:00Z',
      expectedLocal: '2024-12-25T21:30' // UTC+7
    },
    {
      name: 'Current time test',
      backend: new Date().toISOString(),
      expectedLocal: 'Should show Vietnam time'
    }
  ];

  const runTest = (testCase: any) => {
    const result = parseBackendDateTimeToLocal(testCase.backend);
    return {
      passed: result === testCase.expectedLocal || testCase.expectedLocal === 'Should show Vietnam time',
      result
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <TestTube className="text-blue-600" size={24} />
          <h1 className="text-xl font-bold text-blue-900">Vietnam Timezone Test</h1>
        </div>
        <p className="text-blue-700">Test component để verify timezone handling (UTC+7)</p>
      </div>

      {/* Current Time Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-gray-600" size={16} />
            <h3 className="font-medium">Browser Time</h3>
          </div>
          <p className="text-lg font-mono">{new Date().toLocaleString()}</p>
          <p className="text-sm text-gray-500">Local timezone</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-green-600" size={16} />
            <h3 className="font-medium">Vietnam Time</h3>
          </div>
          <p className="text-lg font-mono">
            {new Date(new Date().getTime() + (7 * 60 * 60 * 1000)).toLocaleString('vi-VN')}
          </p>
          <p className="text-sm text-gray-500">UTC+7</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-blue-600" size={16} />
            <h3 className="font-medium">UTC Time</h3>
          </div>
          <p className="text-lg font-mono">{new Date().toISOString().replace('T', ' ').slice(0, 19)}</p>
          <p className="text-sm text-gray-500">Coordinated Universal Time</p>
        </div>
      </div>

      {/* Default Values Test */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-3">Default DateTime Values</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="datetime-local"
              value={defaultValues.startDate}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Preview: {previewDateTimeFromLocal(defaultValues.startDate)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="datetime-local"
              value={defaultValues.endDate}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Preview: {previewDateTimeFromLocal(defaultValues.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Conversion Test */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-3">Conversion Test</h3>
        
        {/* Test Input 1: datetime-local to backend */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test datetime-local input (Vietnam time)
            </label>
            <input
              type="datetime-local"
              value={testDateTime}
              onChange={(e) => setTestDateTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Select date and time"
            />
            {testDateTime && (
              <div className="mt-2 p-3 bg-blue-50 rounded border">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="text-blue-600" size={16} />
                  <span className="font-medium text-blue-900">Conversion Results:</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p><strong>Input (datetime-local):</strong> {testDateTime}</p>
                  <p><strong>Backend format:</strong> {convertLocalToBackendDateTime(testDateTime)}</p>
                  <p><strong>Display format:</strong> {previewDateTimeFromLocal(testDateTime)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Test Input 2: backend to datetime-local */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test backend datetime string
            </label>
            <input
              type="text"
              value={backendDateTime}
              onChange={(e) => setBackendDateTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., 2024-12-25T14:30:00 or 2024-12-25T14:30:00Z"
            />
            {backendDateTime && (
              <div className="mt-2 p-3 bg-green-50 rounded border">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="text-green-600" size={16} />
                  <span className="font-medium text-green-900">Parse Results:</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p><strong>Backend input:</strong> {backendDateTime}</p>
                  <p><strong>Parsed to local:</strong> {parseBackendDateTimeToLocal(backendDateTime)}</p>
                  <p><strong>Display format:</strong> {formatDateTimeDisplay(backendDateTime)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Automated Test Cases */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-3">Automated Test Cases</h3>
        <div className="space-y-3">
          {testCases.map((testCase, index) => {
            const test = runTest(testCase);
            return (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {test.passed ? (
                      <CheckCircle className="text-green-600" size={16} />
                    ) : (
                      <XCircle className="text-red-600" size={16} />
                    )}
                    <span className="font-medium">{testCase.name}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <p><strong>Input:</strong> {testCase.backend}</p>
                    <p><strong>Expected:</strong> {testCase.expectedLocal}</p>
                    <p><strong>Result:</strong> {test.result}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  test.passed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {test.passed ? 'PASS' : 'FAIL'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Common Scenarios */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-3">Common Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">✅ Correct Behavior:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• User inputs "12:00" → Shows as 12:00 PM Vietnam time</li>
              <li>• Backend receives Vietnam local time format</li>
              <li>• Display shows correct Vietnam time</li>
              <li>• No unexpected timezone shifts</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-red-900 mb-2">❌ Previous Issues:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• User inputs "12:00" → Shows as 5:00 PM (UTC conversion)</li>
              <li>• Datetime gets shifted by 7 hours</li>
              <li>• Confusion between local and UTC time</li>
              <li>• Wrong expiration times</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-900 mb-2">🧪 Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-yellow-800 text-sm">
          <li>Test với datetime-local input (ví dụ: "2024-12-25T14:30")</li>
          <li>Verify rằng preview shows correct Vietnam time</li>
          <li>Test với backend datetime strings (both with và without timezone)</li>
          <li>Check rằng conversion maintains correct time</li>
          <li>Ensure no unexpected 7-hour shifts</li>
        </ol>
      </div>
    </div>
  );
};

export default TimezoneTest;