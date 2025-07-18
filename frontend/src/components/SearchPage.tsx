
// import { useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card } from "@/components/ui/card";
// import { Search, ArrowLeft, FileText, User } from "lucide-react";
// import { useNavigate } from 'react-router-dom';
// import { useToast } from "@/hooks/use-toast";

// const SearchPage = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [formData, setFormData] = useState({
//     name: '',
//     city: '',
//     extraTerms: ''
//   });
//   const [isSearching, setIsSearching] = useState(false);
//   const [hasResults, setHasResults] = useState(false);
//   const [personData, setPersonData] = useState<any>(null);
//   const [currentQuote, setCurrentQuote] = useState(0);

//   const osintQuotes = [
//     "Information is the currency of the digital age.",
//     "In data we trust, in ethics we must.",
//     "Intelligence gathering with moral boundaries.",
//     "Knowledge is power, responsibility is wisdom.",
//     "The art of finding needles in digital haystacks.",
//     "Privacy and transparency in perfect balance."
//   ];

//   // Replace the handleSearch function with this:
// const handleSearch = async () => {
//   setIsSearching(true);
//   setHasResults(false);
  
//   // Quote rotation during search
//   const quoteInterval = setInterval(() => {
//     setCurrentQuote((prev) => (prev + 1) % osintQuotes.length);
//   }, 2000);

//   try {
//     const response = await fetch('http://localhost:6969/osint', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(formData)
//     });
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     const data = await response.json();
    
//     clearInterval(quoteInterval);
//     setIsSearching(false);
//     setHasResults(true);
//     setPersonData(data.data);
    
//     toast({
//       title: "Search Completed",
//       description: `Found ${data.data.totalResults} results for ${formData.name}`
//     });
    
//   } catch (error) {
//     clearInterval(quoteInterval);
//     setIsSearching(false);
//     toast({
//       title: "Search Failed",
//       description: `Unable to retrieve information: ${error.message}`,
//       variant: "destructive"
//     });
//   }
// };

// // Replace the handleGenerateReport function with this:
// const handleGenerateReport = async () => {
//   if (!personData) {
//     toast({
//       title: "No Data Available",
//       description: "Please perform a search first to generate a report.",
//       variant: "destructive"
//     });
//     return;
//   }

//   try {
//     const response = await fetch('http://localhost:6969/generate-report', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ personData })
//     });
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     const data = await response.json();
    
//     toast({
//       title: "Report Generated",
//       description: `Report saved as: ${data.reportPath}`
//     });
    
//   } catch (error) {
//     toast({
//       title: "Report Generation Failed",
//       description: `Unable to generate report: ${error.message}`,
//       variant: "destructive"
//     });
//   }
// };

//   return (
//     <div className="min-h-screen bg-black relative overflow-hidden">
//       {/* Purple Grid Background */}
//       <div className="absolute inset-0 opacity-20">
//         <div 
//           className="w-full h-full bg-repeat opacity-40"
//           style={{
//             backgroundImage: `
//               linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px),
//               linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)
//             `,
//             backgroundSize: '40px 40px'
//           }}
//         />
//       </div>

//       {/* Animated Background Nodes */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60"></div>
//         <div className="absolute top-40 right-32 w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-40"></div>
//         <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse opacity-50"></div>
//         <div className="absolute top-60 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-30"></div>
//         <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-300 rounded-full animate-pulse opacity-40"></div>
//       </div>

//       {/* Back Button */}
//       <div className="absolute top-8 left-8 z-10">
//         <Button
//           onClick={() => navigate('/')}
//           className="bg-gray-900/60 backdrop-blur-sm border border-purple-400/30 hover:bg-gray-800/60 text-purple-200"
//         >
//           <ArrowLeft className="w-5 h-5 mr-2" />
//           Back to Home
//         </Button>
//       </div>

//       <div className="min-h-screen flex items-center justify-center p-8">
//         <div className="w-full max-w-2xl space-y-8">
          
//           {/* Search Form */}
//           <Card className="bg-gray-900/60 backdrop-blur-sm border border-purple-400/30 p-8">
//             <div className="space-y-6">
//               <div className="text-center">
//                 <h1 className="text-3xl font-bold text-purple-400 glow-text-purple mb-2">OSINT Search</h1>
//                 <p className="text-purple-200/70">Enter search parameters below</p>
//               </div>

//               {/* Disclaimer */}
//               <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg backdrop-blur-sm">
//                 <p className="text-red-300 text-sm">
//                   <strong>Disclaimer:</strong> Do not use this tool for stalking or illegal purposes.
//                 </p>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="name" className="text-purple-200">Name</Label>
//                   <Input
//                     id="name"
//                     value={formData.name}
//                     onChange={(e) => setFormData({...formData, name: e.target.value})}
//                     className="bg-gray-800/60 border-purple-400/30 text-purple-100 focus:border-purple-400 backdrop-blur-sm"
//                     placeholder="Enter target name"
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="city" className="text-purple-200">City</Label>
//                   <Input
//                     id="city"
//                     value={formData.city}
//                     onChange={(e) => setFormData({...formData, city: e.target.value})}
//                     className="bg-gray-800/60 border-purple-400/30 text-purple-100 focus:border-purple-400 backdrop-blur-sm"
//                     placeholder="Enter city"
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="extraTerms" className="text-purple-200">Extra Terms</Label>
//                   <Input
//                     id="extraTerms"
//                     value={formData.extraTerms}
//                     onChange={(e) => setFormData({...formData, extraTerms: e.target.value})}
//                     className="bg-gray-800/60 border-purple-400/30 text-purple-100 focus:border-purple-400 backdrop-blur-sm"
//                     placeholder="Additional search terms"
//                   />
//                 </div>
//               </div>

//               <Button
//                 onClick={handleSearch}
//                 disabled={isSearching || !formData.name}
//                 className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 border border-purple-400/30 backdrop-blur-sm flex items-center justify-center space-x-2"
//               >
//                 <Search className="w-5 h-5" />
//                 <span>{isSearching ? 'Searching...' : 'Search'}</span>
//               </Button>
//             </div>
//           </Card>

//           {/* Processing Quotes */}
//           {isSearching && (
//             <Card className="bg-gray-900/60 backdrop-blur-sm border border-purple-400/30 p-8">
//               <div className="text-center space-y-4">
//                 <div className="w-12 h-12 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
//                 <p className="text-purple-200 text-lg italic transition-all duration-1000">
//                   "{osintQuotes[currentQuote]}"
//                 </p>
//                 <p className="text-purple-300/70">Processing your request...</p>
//               </div>
//             </Card>
//           )}

//           {/* Summarizer Results */}
//           {hasResults && personData && (
//             <Card className="bg-gray-900/60 backdrop-blur-sm border border-purple-400/30 p-8">
//               <div className="space-y-6">
//                 <div className="flex items-center space-x-3">
//                   <User className="w-6 h-6 text-purple-400" />
//                   <h2 className="text-2xl font-bold text-purple-400">Person Summary</h2>
//                 </div>
                
//                 <div className="space-y-4">
//                   <div className="bg-purple-400/10 border border-purple-400/30 p-6 rounded-lg backdrop-blur-sm">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                       <div>
//                         <h3 className="text-purple-200 font-semibold text-sm uppercase tracking-wide">Name</h3>
//                         <p className="text-white text-lg">{personData.name}</p>
//                       </div>
//                       <div>
//                         <h3 className="text-purple-200 font-semibold text-sm uppercase tracking-wide">Location</h3>
//                         <p className="text-white text-lg">{personData.location || 'Not specified'}</p>
//                       </div>
//                       <div>
//                         <h3 className="text-purple-200 font-semibold text-sm uppercase tracking-wide">Confidence</h3>
//                         <p className="text-green-400 text-lg font-semibold">{personData.confidence}</p>
//                       </div>
//                       <div>
//                         <h3 className="text-purple-200 font-semibold text-sm uppercase tracking-wide">Last Updated</h3>
//                         <p className="text-purple-100 text-lg">{personData.lastUpdated}</p>
//                       </div>
//                     </div>
                    
//                     <div>
//                       <h3 className="text-purple-200 font-semibold text-sm uppercase tracking-wide mb-3">Summary</h3>
//                       <p className="text-purple-100/90 leading-relaxed">
//                         {personData.summary}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <Button
//                   onClick={handleGenerateReport}
//                   className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 border border-purple-400/30 backdrop-blur-sm flex items-center justify-center space-x-2"
//                 >
//                   <FileText className="w-5 h-5" />
//                   <span>Generate Report</span>
//                 </Button>
//               </div>
//             </Card>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SearchPage;


import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Search, ArrowLeft, FileText, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import { API_BASE_URL } from "@/config";

const SearchPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    extraTerms: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [personData, setPersonData] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [progress, setProgress] = useState({ percentage: 0, stage: '', status: 'idle' });

  const osintQuotes = [
    "Information is the currency of the digital age.",
    "In data we trust, in ethics we must.",
    "Intelligence gathering with moral boundaries.",
    "Knowledge is power, responsibility is wisdom.",
    "The art of finding needles in digital haystacks.",
    "Privacy and transparency in perfect balance."
  ];

  const pollProgress = async (searchId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/progress/${searchId}`);
        const progressData = await response.json();
        
        setProgress(progressData);
        
        if (progressData.status === 'completed') {
          clearInterval(pollInterval);
          setIsSearching(false);
          setHasResults(true);
          setPersonData(progressData.result);
          
          toast({
            title: "Search Completed",
            description: `Successfully found information for ${formData.name}`
          });
        } else if (progressData.status === 'error') {
          clearInterval(pollInterval);
          setIsSearching(false);
          setProgress({ ...progressData, percentage: 0 });
          
          toast({
            title: "Search Failed",
            description: progressData.error,
            variant: "destructive"
          });
        }
      } catch (error) {
        clearInterval(pollInterval);
        setIsSearching(false);
        setProgress({ percentage: 0, stage: 'Connection error', status: 'error' });
        
        toast({
          title: "Connection Error",
          description: "Unable to connect to server",
          variant: "destructive"
        });
      }
    }, 500); // Poll every 500ms
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setHasResults(false);
    setProgress({ percentage: 0, stage: 'Starting search...', status: 'running' });
    
    // Quote rotation during search
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % osintQuotes.length);
    }, 2000);

    try {
      const response = await fetch(`${API_BASE_URL}/osint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.searchId) {
        // Start polling for progress
        pollProgress(data.searchId);
      }
      
    } catch (error) {
      clearInterval(quoteInterval);
      setIsSearching(false);
      setProgress({ percentage: 0, stage: 'Search failed', status: 'error' });
      
      toast({
        title: "Search Failed",
        description: `Unable to retrieve information: ${error.message}`,
        variant: "destructive"
      });
    }
    
    // Clear quote interval when search is done
    setTimeout(() => clearInterval(quoteInterval), 30000); // Cleanup after 30 seconds max
  };

  const handleGenerateReport = async () => {
    if (!personData) {
      toast({
        title: "No Data Available",
        description: "Please perform a search first to generate a report.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personData })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      toast({
        title: "Report Generated",
        description: `Report saved as: ${data.reportPath}`
      });
      
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: `Unable to generate report: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Purple Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full bg-repeat opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Animated Background Nodes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-60 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-30"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-300 rounded-full animate-pulse opacity-40"></div>
      </div>

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-10">
        <Button
          onClick={() => navigate('/')}
          className="bg-gray-900/60 backdrop-blur-sm border border-purple-400/30 hover:bg-gray-800/60 text-purple-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Button>
      </div>

      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-8">
          
          {/* Search Form */}
          <Card className="bg-gray-900/60 backdrop-blur-sm border border-purple-400/30 p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-purple-400 glow-text-purple mb-2">OSINT Search</h1>
                <p className="text-purple-200/70">Enter search parameters below</p>
              </div>

              {/* Disclaimer */}
              <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg backdrop-blur-sm">
                <p className="text-red-300 text-sm">
                  <strong>Disclaimer:</strong> Do not use this tool for stalking or illegal purposes.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-purple-200">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-gray-800/60 border-purple-400/30 text-purple-100 focus:border-purple-400 backdrop-blur-sm"
                    placeholder="Enter target name"
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-purple-200">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="bg-gray-800/60 border-purple-400/30 text-purple-100 focus:border-purple-400 backdrop-blur-sm"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <Label htmlFor="extraTerms" className="text-purple-200">Extra Terms</Label>
                  <Input
                    id="extraTerms"
                    value={formData.extraTerms}
                    onChange={(e) => setFormData({...formData, extraTerms: e.target.value})}
                    className="bg-gray-800/60 border-purple-400/30 text-purple-100 focus:border-purple-400 backdrop-blur-sm"
                    placeholder="Additional search terms"
                  />
                </div>
              </div>

              <Button
                onClick={handleSearch}
                disabled={isSearching || !formData.name}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 border border-purple-400/30 backdrop-blur-sm flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>{isSearching ? 'Searching...' : 'Search'}</span>
              </Button>
            </div>
          </Card>

          {/* Processing Quotes */}
          {isSearching && (
            <Card className="bg-gray-900/60 backdrop-blur-sm border border-purple-400/30 p-8">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-purple-200 text-lg italic transition-all duration-1000">
                  "{osintQuotes[currentQuote]}"
                </p>
                <p className="text-purple-300/70">Processing your request...</p>
                
                {/* Progress Bar */}
                {progress.stage && (
                  <div className="space-y-3 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200 text-sm">{progress.stage}</span>
                      <span className="text-purple-400 font-bold text-sm">{progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-800/60 rounded-full h-2 backdrop-blur-sm border border-purple-400/20">
                      <motion.div
                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Results */}
          {hasResults && personData && (
            <Card className="bg-gray-900/60 backdrop-blur-sm border border-purple-400/30 p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <User className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-purple-400">Person Summary</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-purple-400/10 border border-purple-400/30 p-6 rounded-lg backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="text-purple-200 font-semibold text-sm uppercase tracking-wide">Name</h3>
                        <p className="text-white text-lg">{personData.name}</p>
                      </div>
                      <div>
                        <h3 className="text-purple-200 font-semibold text-sm uppercase tracking-wide">Location</h3>
                        <p className="text-white text-lg">{personData.location || 'Not specified'}</p>
                      </div>
                      <div>
                        <h3 className="text-purple-200 font-semibold text-sm uppercase tracking-wide">Confidence</h3>
                        <p className="text-green-400 text-lg font-semibold">{personData.confidence}</p>
                      </div>
                      <div>
                        <h3 className="text-purple-200 font-semibold text-sm uppercase tracking-wide">Last Updated</h3>
                        <p className="text-purple-100 text-lg">{personData.lastUpdated}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-purple-200 font-semibold text-sm uppercase tracking-wide mb-3">Summary</h3>
                      <p className="text-purple-100/90 leading-relaxed">
                        {personData.summary}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 border border-purple-400/30 backdrop-blur-sm flex items-center justify-center space-x-2"
                >
                  <FileText className="w-5 h-5" />
                  <span>Generate Report</span>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
