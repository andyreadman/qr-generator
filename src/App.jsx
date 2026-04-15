import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Link, MessageSquare, User, Download, Copy, Check } from 'lucide-react';

const QRCodeGenerator = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef(null);

  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState({
    firstName: '', lastName: '', phone: '', email: '', organization: '', url: ''
  });

  const generateQRCode = async (text) => {
    if (!text.trim()) {
      if (qrContainerRef.current) qrContainerRef.current.innerHTML = '';
      return;
    }
    if (!window.QRious) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
      script.onload = () => createQR(text);
      document.head.appendChild(script);
    } else {
      createQR(text);
    }
  };

  const createQR = (text) => {
    if (!qrContainerRef.current) return;
    qrContainerRef.current.innerHTML = '';
    const canvas = document.createElement('canvas');
    qrContainerRef.current.appendChild(canvas);
    new window.QRious({ element: canvas, value: text, size: 300, background: 'white', foreground: 'black', level: 'M' });
    canvas.style.maxWidth = '300px';
    canvas.style.height = 'auto';
  };

  const formatUrl = (url) => {
    if (!url.trim()) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url;
  };

  const generateVCard = (c) =>
    `BEGIN:VCARD\nVERSION:3.0\nFN:${c.firstName} ${c.lastName}\nN:${c.lastName};${c.firstName};;;\nORG:${c.organization}\nTEL:${c.phone}\nEMAIL:${c.email}\nURL:${c.url}\nEND:VCARD`;

  useEffect(() => {
    let data = '';
    if (activeTab === 'url') data = formatUrl(urlInput);
    else if (activeTab === 'text') data = textInput;
    else if (activeTab === 'contact' && (contactInfo.firstName || contactInfo.lastName || contactInfo.phone || contactInfo.email))
      data = generateVCard(contactInfo);
    setQrData(data);
    generateQRCode(data);
  }, [activeTab, urlInput, textInput, contactInfo]);

  const downloadQRCode = () => {
    const canvas = qrContainerRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const copyToClipboard = async () => {
    if (qrData) {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setUrlInput(''); setTextInput('');
    setContactInfo({ firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' });
    setQrData('');
    if (qrContainerRef.current) qrContainerRef.current.innerHTML = '';
  };

  const tabs = [
    { id: 'url', label: 'URL', icon: Link },
    { id: 'text', label: 'Text', icon: MessageSquare },
    { id: 'contact', label: 'Contact', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">QR Code Generator</h1>
          <p className="text-gray-600 text-lg">Generate QR codes for URLs, text, and contact information</p>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${activeTab === id ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {activeTab === 'url' && 'Enter URL'}{activeTab === 'text' && 'Enter Text'}{activeTab === 'contact' && 'Contact Information'}
                </h2>
                {activeTab === 'url' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                    <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                      placeholder="example.com or https://example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" />
                    <p className="text-xs text-gray-500 mt-1">https:// will be added automatically if omitted.</p>
                  </div>
                )}
                {activeTab === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
                    <textarea value={textInput} onChange={e => setTextInput(e.target.value)}
                      placeholder="Enter any text to generate QR code..." rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none" />
                  </div>
                )}
                {activeTab === 'contact' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {['firstName', 'lastName'].map(f => (
                        <div key={f}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{f === 'firstName' ? 'First Name' : 'Last Name'}</label>
                          <input type="text" value={contactInfo[f]} onChange={e => setContactInfo({...contactInfo, [f]: e.target.value})}
                            placeholder={f === 'firstName' ? 'John' : 'Doe'}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" />
                        </div>
                      ))}
                    </div>
                    {[['phone', 'Phone Number', 'tel', '+1 (555) 123-4567'], ['email', 'Email Address', 'email', 'john@example.com'], ['organization', 'Organization', 'text', 'Company Name'], ['url', 'Website', 'url', 'https://example.com']].map(([f, label, type, ph]) => (
                      <div key={f}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                        <input type={type} value={contactInfo[f]} onChange={e => setContactInfo({...contactInfo, [f]: e.target.value})}
                          placeholder={ph}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" />
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={resetForm} className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium">Clear All Fields</button>
              </div>
              <div className="flex flex-col items-center space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Generated QR Code</h2>
                <div className="bg-gray-50 rounded-2xl p-8 w-full max-w-sm">
                  {qrData ? (
                    <div className="text-center">
                      <div ref={qrContainerRef} className="flex justify-center" />
                      <p className="text-sm text-gray-600 mt-4">Scan this QR code with your device</p>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Fill in the form to generate your QR code</p>
                    </div>
                  )}
                </div>
                {qrData && (
                  <div className="flex gap-4 w-full max-w-sm">
                    <button onClick={downloadQRCode}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg">
                      <Download className="w-4 h-4" />Download
                    </button>
                    <button onClick={copyToClipboard}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium">
                      {copied ? <><Check className="w-4 h-4 text-green-600" />Copied!</> : <><Copy className="w-4 h-4" />Copy Data</>}
                    </button>
                  </div>
                )}
                {qrData && (
                  <div className="w-full max-w-sm">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">QR Code Data:</h3>
                    <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-600 max-h-32 overflow-y-auto">
                      <pre className="whitespace-pre-wrap break-words">{qrData}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Generate QR codes instantly • No data stored • Free to use</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
