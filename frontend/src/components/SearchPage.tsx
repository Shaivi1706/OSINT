// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
//   CardDescription,
// } from "@/components/ui/card";
// import {
//   Search,
//   ArrowLeft,
//   FileText,
//   User,
//   Loader2,
//   ShieldAlert,
//   TrendingUp,
//   BarChart,
//   CalendarClock,
//   Database,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useToast } from "@/hooks/use-toast";
// import { motion, AnimatePresence } from "framer-motion";
// import { API_BASE_URL } from "@/config";
// import {
//   Radar,
//   RadarChart,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   ResponsiveContainer,
//   Tooltip,
//   Legend,
// } from "recharts";

// // --- Helper Functions for Dynamic Styling ---

// const getRiskColor = (score) => {
//   if (score >= 7) return "text-red-400";
//   if (score >= 4) return "text-yellow-400";
//   return "text-green-400";
// };

// const getSentimentColor = (score) => {
//   if (score > 0.1) return "text-green-400";
//   if (score < -0.1) return "text-red-400";
//   return "text-gray-400";
// };

// const getSourceColor = (source) => {
//   switch (source) {
//     case "LinkedIn":
//       return "bg-blue-500";
//     case "Case/News":
//       return "bg-amber-500";
//     case "Reddit":
//       return "bg-orange-500";
//     case "Wikipedia":
//       return "bg-gray-400";
//     case "Business":
//       return "bg-teal-500";
//     case "Academic":
//       return "bg-indigo-500";
//     default:
//       return "bg-purple-500";
//   }
// };

// const SearchPage = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [formData, setFormData] = useState({
//     name: "",
//     city: "",
//     extraTerms: "",
//   });
//   const [isSearching, setIsSearching] = useState(false);
//   const [hasResults, setHasResults] = useState(false);
//   const [personData, setPersonData] = useState(null);
//   const [currentQuote, setCurrentQuote] = useState(0);
//   const [progress, setProgress] = useState({
//     percentage: 0,
//     stage: "",
//     status: "idle",
//   });
//   const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

//   const osintQuotes = [
//     "Information is the currency of the digital age.",
//     "Uncovering the unseen, one data point at a time.",
//     "Intelligence gathering with moral boundaries.",
//     "Knowledge is power, responsibility is wisdom.",
//     "The art of finding needles in digital haystacks.",
//     "Connecting the dots in a world of data.",
//   ];

//   useEffect(() => {
//     let quoteInterval;
//     if (isSearching) {
//       quoteInterval = setInterval(() => {
//         setCurrentQuote((prev) => (prev + 1) % osintQuotes.length);
//       }, 2500);
//     }
//     return () => clearInterval(quoteInterval);
//   }, [isSearching]);

//   useEffect(() => {
//     if (personData) {
//       console.log("--- Full Backend Response ---");
//       console.log(personData);
//     }
//   }, [personData]);

//   // --- API Interaction Logic ---

//   const pollProgress = (searchId) => {
//     const pollInterval = setInterval(async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/progress/${searchId}`);
//         if (!response.ok)
//           throw new Error(`Server responded with status: ${response.status}`);

//         const progressData = await response.json();
//         setProgress(progressData);

//         if (progressData.status === "completed") {
//           clearInterval(pollInterval);
//           setIsSearching(false);
//           setHasResults(true);
//           setPersonData(progressData.result);
//           toast({
//             title: "Search Completed",
//             description: `Successfully found information for ${formData.name}`,
//           });
//         } else if (progressData.status === "error") {
//           clearInterval(pollInterval);
//           setIsSearching(false);
//           setProgress({ ...progressData, percentage: 0 });
//           toast({
//             title: "Search Failed",
//             description: progressData.error || "An unknown error occurred.",
//             variant: "destructive",
//           });
//         }
//       } catch (error) {
//         clearInterval(pollInterval);
//         setIsSearching(false);
//         setProgress({
//           percentage: 0,
//           stage: "Connection error",
//           status: "error",
//         });
//         toast({
//           title: "Connection Error",
//           description: "Unable to connect to the server.",
//           variant: "destructive",
//         });
//       }
//     }, 1000);
//   };

//   const handleSearch = async () => {
//     setIsSearching(true);
//     setHasResults(false);
//     setPersonData(null);
//     setProgress({
//       percentage: 0,
//       stage: "Initiating search...",
//       status: "running",
//     });

//     try {
//       const response = await fetch(`${API_BASE_URL}/osint`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) {
//         const errorData = await response
//           .json()
//           .catch(() => ({ error: "An unknown server error occurred." }));
//         throw new Error(
//           errorData.error || `HTTP error! status: ${response.status}`
//         );
//       }

//       const data = await response.json();
//       if (data.searchId) {
//         pollProgress(data.searchId);
//       } else {
//         throw new Error("Did not receive a valid search ID from the server.");
//       }
//     } catch (error) {
//       setIsSearching(false);
//       setProgress({ percentage: 0, stage: "Search failed", status: "error" });
//       toast({
//         title: "Search Failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     }
//   };

//   const startNewSearch = () => {
//     setHasResults(false);
//     setPersonData(null);
//     setFormData({ name: "", city: "", extraTerms: "" });
//   };

//   // --- Data for Chart ---
//   const chartData =
//     personData?.sourceAnalysis?.map((source) => ({
//       subject: source.name,
//       A: source.count,
//       fullMark:
//         Math.max(...personData.sourceAnalysis.map((s) => s.count), 0) + 5,
//     })) || [];

//   return (
//     <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden p-4 sm:p-8 font-sans">
//       <div
//         className="absolute inset-0 opacity-20"
//         style={{
//           backgroundImage: `radial-gradient(circle at center, rgba(167, 139, 250, 0.3), transparent 60%), linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)`,
//           backgroundSize: "100% 100%, 40px 40px, 40px 40px",
//         }}
//       />
//       {!hasResults && (
//         <div className="absolute top-6 left-6 z-20">
//           <Button
//             onClick={() => navigate("/")}
//             className="bg-gray-900/60 backdrop-blur-sm border border-purple-400/30 hover:bg-gray-800/60 text-purple-200"
//           >
//             <ArrowLeft className="w-5 h-5 mr-2" />
//             Back to Home
//           </Button>
//         </div>
//       )}

//       <div className="relative z-10 flex flex-col items-center justify-center w-full">
//         <AnimatePresence mode="wait">
//           {/* --- SEARCH VIEW --- */}
//           {!isSearching && !hasResults && (
//             <motion.div
//               key="search"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               className="w-full max-w-4xl"
//             >
//               <Card className="bg-gray-900/70 backdrop-blur-md border border-purple-400/30 p-12 shadow-2xl shadow-purple-500/10">
//                 <CardHeader className="text-center p-0 mb-8">
//                   <h1 className="text-5xl font-bold text-purple-300">
//                     OSINT Intelligence Terminal
//                   </h1>
//                   <p className="text-purple-200/70 text-xl mt-3">
//                     Enter target parameters to begin investigation
//                   </p>
//                 </CardHeader>
//                 <CardContent className="p-0 space-y-8">
//                   <div>
//                     <Label
//                       htmlFor="name"
//                       className="text-purple-200 mb-3 block text-lg"
//                     >
//                       Full Name
//                     </Label>
//                     <Input
//                       id="name"
//                       value={formData.name}
//                       onChange={(e) =>
//                         setFormData({ ...formData, name: e.target.value })
//                       }
//                       className="bg-gray-800/60 border-purple-400/40 text-purple-100 focus:border-purple-400 p-4 text-xl"
//                       placeholder="e.g., John Doe"
//                     />
//                   </div>
//                   <div>
//                     <Label
//                       htmlFor="city"
//                       className="text-purple-200 mb-3 block text-lg"
//                     >
//                       City / Region
//                     </Label>
//                     <Input
//                       id="city"
//                       value={formData.city}
//                       onChange={(e) =>
//                         setFormData({ ...formData, city: e.target.value })
//                       }
//                       className="bg-gray-800/60 border-purple-400/40 text-purple-100 focus:border-purple-400 p-4 text-xl"
//                       placeholder="e.g., New York"
//                     />
//                   </div>
//                   <div>
//                     <Label
//                       htmlFor="extraTerms"
//                       className="text-purple-200 mb-3 block text-lg"
//                     >
//                       Additional Keywords
//                     </Label>
//                     <Input
//                       id="extraTerms"
//                       value={formData.extraTerms}
//                       onChange={(e) =>
//                         setFormData({ ...formData, extraTerms: e.target.value })
//                       }
//                       className="bg-gray-800/60 border-purple-400/40 text-purple-100 focus:border-purple-400 p-4 text-xl"
//                       placeholder="e.g., CEO, TechCorp, lawsuit"
//                     />
//                   </div>
//                   <Button
//                     onClick={handleSearch}
//                     disabled={!formData.name}
//                     className="w-full !mt-10 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold py-4 text-xl rounded-lg"
//                   >
//                     <Search className="w-6 h-6 mr-3" />
//                     Initiate Search
//                   </Button>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           )}

//           {/* --- LOADING VIEW --- */}
//           {isSearching && (
//             <motion.div
//               key="loading"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="w-full max-w-2xl"
//             >
//               <Card className="bg-gray-900/60 backdrop-blur-sm border border-purple-400/30 p-8 text-center">
//                 <motion.div
//                   key={currentQuote}
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ duration: 1 }}
//                   className="text-purple-200 text-lg italic mb-4"
//                 >
//                   "{osintQuotes[currentQuote]}"
//                 </motion.div>
//                 <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
//                 <p className="text-purple-300/80 mb-6">
//                   Processing your request...
//                 </p>
//                 {progress.stage && (
//                   <div className="space-y-3 text-left">
//                     <div className="flex justify-between items-center text-sm">
//                       <span className="text-purple-200">{progress.stage}</span>
//                       <span className="text-purple-400 font-bold">
//                         {Math.round(progress.percentage)}%
//                       </span>
//                     </div>
//                     <div className="w-full bg-gray-800/60 rounded-full h-2.5">
//                       <motion.div
//                         className="h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-violet-600"
//                         animate={{ width: `${progress.percentage}%` }}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </Card>
//             </motion.div>
//           )}

//           {/* --- RESULTS VIEW --- */}
//           {hasResults && personData && (
//             <motion.div
//               key="results"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="w-full max-w-7xl"
//             >
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 <div className="lg:col-span-2 space-y-8">
//                   <Card className="bg-gray-900/70 backdrop-blur-md border border-purple-400/30">
//                     <CardHeader>
//                       <CardTitle className="flex items-center text-3xl text-purple-300">
//                         <User className="w-8 h-8 mr-4" />
//                         {personData.name}
//                       </CardTitle>
//                       <CardDescription className="text-purple-200/60">
//                         Intelligence Dossier | Location Context:{" "}
//                         {personData.location}
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <Card className="bg-black/20 p-4 border-purple-400/20">
//                           <CardHeader className="p-0 flex flex-row items-center justify-between">
//                             <CardTitle className="text-base text-purple-200/80">
//                               Risk Score
//                             </CardTitle>
//                             <ShieldAlert className="w-5 h-5 text-purple-400" />
//                           </CardHeader>
//                           <CardContent className="p-0 mt-2">
//                             <p
//                               className={`text-5xl font-bold ${getRiskColor(
//                                 personData.riskAnalysis?.riskScore
//                               )}`}
//                             >
//                               {personData.riskAnalysis?.riskScore}/10
//                             </p>
//                             <p className="text-xs text-gray-400 mt-1">
//                               {personData.riskAnalysis?.riskJustification}
//                             </p>
//                           </CardContent>
//                         </Card>
//                         <Card className="bg-black/20 p-4 border-purple-400/20">
//                           <CardHeader className="p-0 flex flex-row items-center justify-between">
//                             <CardTitle className="text-base text-purple-200/80">
//                               Public Sentiment
//                             </CardTitle>
//                             <TrendingUp className="w-5 h-5 text-purple-400" />
//                           </CardHeader>
//                           <CardContent className="p-0 mt-2">
//                             <p
//                               className={`text-5xl font-bold ${getSentimentColor(
//                                 personData.riskAnalysis?.sentimentScore
//                               )}`}
//                             >
//                               {personData.riskAnalysis?.sentimentScore.toFixed(
//                                 2
//                               )}
//                             </p>
//                             <p className="text-xs text-gray-400 mt-1">
//                               {personData.riskAnalysis?.sentimentJustification}
//                             </p>
//                           </CardContent>
//                         </Card>
//                       </div>
//                       <div className="space-y-2">
//                         <h4 className="font-semibold text-purple-200/70 text-sm">
//                           AI-Generated Summary
//                         </h4>
//                         <motion.div className="text-purple-100/90 leading-relaxed bg-black/20 p-4 rounded-md border border-purple-400/20 text-base overflow-hidden">
//                           <p>
//                             <strong>Executive Summary:</strong>{" "}
//                             {personData.short_summary}
//                           </p>
//                           <AnimatePresence>
//                             {isSummaryExpanded && (
//                               <motion.div
//                                 initial={{
//                                   opacity: 0,
//                                   height: 0,
//                                   marginTop: 0,
//                                 }}
//                                 animate={{
//                                   opacity: 1,
//                                   height: "auto",
//                                   marginTop: "16px",
//                                 }}
//                                 exit={{ opacity: 0, height: 0, marginTop: 0 }}
//                                 transition={{
//                                   duration: 0.4,
//                                   ease: "easeInOut",
//                                 }}
//                               >
//                                 <p>
//                                   <strong>Detailed Analysis:</strong>{" "}
//                                   {personData.detailed_summary}
//                                 </p>
//                               </motion.div>
//                             )}
//                           </AnimatePresence>
//                         </motion.div>
//                         <Button
//                           variant="link"
//                           onClick={() =>
//                             setIsSummaryExpanded(!isSummaryExpanded)
//                           }
//                           className="text-purple-300 p-0 h-auto"
//                         >
//                           {isSummaryExpanded
//                             ? "Show Less"
//                             : "Show Detailed Analysis..."}
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   <Card className="bg-gray-900/70 backdrop-blur-md border border-purple-400/30">
//                     <CardHeader>
//                       <CardTitle className="flex items-center text-2xl text-purple-300">
//                         <CalendarClock className="w-6 h-6 mr-3" />
//                         Evidence Timeline
//                       </CardTitle>
//                       <CardDescription className="text-purple-200/60">
//                         Chronological events extracted from data sources.
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="relative pl-6">
//                       {personData.timelineEvents &&
//                       personData.timelineEvents.length > 0 ? (
//                         <>
//                           <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-purple-400/30"></div>
//                           <div className="space-y-8">
//                             {personData.timelineEvents.map((event, index) => (
//                               <div
//                                 key={index}
//                                 className="relative flex items-start"
//                               >
//                                 <div className="absolute left-0 top-1.5 flex items-center justify-center w-5 h-5 bg-gray-800 rounded-full border-2 border-purple-400">
//                                   <div
//                                     className={`w-2 h-2 rounded-full ${getSourceColor(
//                                       event.source
//                                     )}`}
//                                   ></div>
//                                 </div>
//                                 <div className="ml-12">
//                                   <p className="font-bold text-purple-200">
//                                     {event.date}
//                                   </p>
//                                   <p className="text-purple-100/90">
//                                     {event.title}
//                                   </p>
//                                   <p
//                                     className={`text-xs font-semibold px-2 py-0.5 mt-1 inline-block rounded-full text-white ${getSourceColor(
//                                       event.source
//                                     )}`}
//                                   >
//                                     {event.source}
//                                   </p>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </>
//                       ) : (
//                         <div className="flex items-center justify-center h-24 text-center">
//                           <p className="text-purple-200/70">
//                             No chronological events could be extracted from the
//                             data sources.
//                           </p>
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>

//                   <Card className="bg-gray-900/70 backdrop-blur-md border border-purple-400/30">
//                     <CardHeader>
//                       <CardTitle className="flex items-center text-2xl text-purple-300">
//                         <Database className="w-6 h-6 mr-3" />
//                         Raw Intelligence Data
//                       </CardTitle>
//                       <CardDescription className="text-purple-200/60">
//                         The complete list of data points gathered for this
//                         search.
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="max-h-96 overflow-y-auto space-y-4 pr-4">
//                       {personData.raw_data && personData.raw_data.length > 0 ? (
//                         personData.raw_data.map((item, index) => (
//                           <div
//                             key={index}
//                             className="p-4 bg-black/20 rounded-lg border border-purple-400/20"
//                           >
//                             <h3 className="font-bold text-purple-200">
//                               {item.title}
//                             </h3>
//                             <p className="text-sm text-purple-100/80 mt-1">
//                               {item.snippet}
//                             </p>
//                             <div className="mt-2 flex justify-between items-center">
//                               <a
//                                 href={item.link}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-xs text-purple-400 hover:underline"
//                               >
//                                 View Source
//                               </a>
//                               <span
//                                 className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${getSourceColor(
//                                   item.source
//                                 )}`}
//                               >
//                                 {item.source}
//                               </span>
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <p className="text-purple-200/70 text-center">
//                           No raw data available.
//                         </p>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </div>

//                 <div className="space-y-8">
//                   <Card className="bg-gray-900/70 backdrop-blur-md border border-purple-400/30">
//                     <CardHeader>
//                       <CardTitle className="flex items-center text-xl text-purple-300">
//                         <BarChart className="w-5 h-5 mr-3" />
//                         Source Analysis
//                       </CardTitle>
//                       <CardDescription className="text-purple-200/60">
//                         Volume of findings across data sources.
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <ResponsiveContainer width="100%" height={300}>
//                         <RadarChart
//                           cx="50%"
//                           cy="50%"
//                           outerRadius="70%" // <-- Reduced this from 80% to create more space
//                           data={chartData}
//                           margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
//                         >
//                           <PolarGrid stroke="rgba(167, 139, 250, 0.2)" />
//                           <PolarAngleAxis
//                             dataKey="subject"
//                             stroke="rgba(224, 204, 255, 0.7)"
//                             tickLine={false}
//                           />
//                           <PolarRadiusAxis
//                             angle={30}
//                             domain={[0, "dataMax + 5"]}
//                             tick={false}
//                             axisLine={false}
//                           />
//                           <Radar
//                             name="Findings"
//                             dataKey="A"
//                             stroke="#a78bfa"
//                             fill="#8b5cf6"
//                             fillOpacity={0.6}
//                           />
//                           <Tooltip
//                             contentStyle={{
//                               backgroundColor: "rgba(30, 30, 40, 0.9)",
//                               borderColor: "rgba(136, 132, 216, 0.5)",
//                             }}
//                           />
//                           <Legend />
//                         </RadarChart>
//                       </ResponsiveContainer>
//                     </CardContent>
//                   </Card>
//                   <div className="grid grid-cols-2 gap-4">
//                     <Button
//                       onClick={startNewSearch}
//                       className="w-full bg-gray-700 hover:bg-gray-600 text-purple-200 font-bold py-3"
//                     >
//                       <Search className="w-5 h-5 mr-2" />
//                       New Search
//                     </Button>
//                     <Button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 text-white font-bold py-3">
//                       <FileText className="w-5 h-5 mr-2" />
//                       Generate Report
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// };
// //change done
// export default SearchPage;

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
Card,
CardHeader,
CardTitle,
CardContent,
CardDescription,
} from "@/components/ui/card";
import {
Search,
ArrowLeft,
FileText,
User,
Loader2,
ShieldAlert,
TrendingUp,
BarChart,
CalendarClock,
Database,
MessageCircle,
Send,
Bot,
UserIcon,
X,
Maximize2,
Minimize2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/config";
import {
Radar,
RadarChart,
PolarGrid,
PolarAngleAxis,
PolarRadiusAxis,
ResponsiveContainer,
Tooltip,
Legend,
} from "recharts";

// --- Helper Functions for Dynamic Styling ---
const getRiskColor = (score) => {
if (score >= 7) return "text-red-400";
if (score >= 4) return "text-yellow-400";
return "text-green-400";
};

const getSentimentColor = (score) => {
if (score > 0.1) return "text-green-400";
if (score < -0.1) return "text-red-400";
return "text-gray-400";
};

const getSourceColor = (source) => {
switch (source) {
case "LinkedIn":
return "bg-blue-500";
case "Case/News":
return "bg-amber-500";
case "Reddit":
return "bg-orange-500";
case "Wikipedia":
return "bg-gray-400";
case "Business":
return "bg-teal-500";
case "Academic":
return "bg-indigo-500";
default:
return "bg-purple-500";
 }
};

const SearchPage = () => {
const navigate = useNavigate();
const { toast } = useToast();
const chatMessagesRef = useRef(null);
const [formData, setFormData] = useState({
name: "",
city: "",
extraTerms: "",
 });
const [isSearching, setIsSearching] = useState(false);
const [hasResults, setHasResults] = useState(false);
const [personData, setPersonData] = useState(null);
const [currentQuote, setCurrentQuote] = useState(0);
const [progress, setProgress] = useState({
percentage: 0,
stage: "",
status: "idle",
 });
const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
const [currentSearchId, setCurrentSearchId] = useState(null);

// Chatbot states
const [isChatbotOpen, setIsChatbotOpen] = useState(false);
const [isChatbotMaximized, setIsChatbotMaximized] = useState(false);
const [chatMessages, setChatMessages] = useState([]);
const [currentQuestion, setCurrentQuestion] = useState("");
const [isAskingQuestion, setIsAskingQuestion] = useState(false);

const osintQuotes = [
"Information is the currency of the digital age.",
"Uncovering the unseen, one data point at a time.",
"Intelligence gathering with moral boundaries.",
"Knowledge is power, responsibility is wisdom.",
"The art of finding needles in digital haystacks.",
"Connecting the dots in a world of data.",
 ];

useEffect(() => {
let quoteInterval;
if (isSearching) {
quoteInterval = setInterval(() => {
setCurrentQuote((prev) => (prev + 1) % osintQuotes.length);
 }, 2500);
 }
return () => clearInterval(quoteInterval);
 }, [isSearching]);

useEffect(() => {
if (personData) {
console.log("--- Full Backend Response ---");
console.log(personData);
 }
 }, [personData]);

// Auto-scroll chat messages
useEffect(() => {
if (chatMessagesRef.current) {
chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
 }
 }, [chatMessages]);

// --- API Interaction Logic ---
const pollProgress = (searchId) => {
const pollInterval = setInterval(async () => {
try {
const response = await fetch(`${API_BASE_URL}/progress/${searchId}`);
if (!response.ok)
throw new Error(`Server responded with status: ${response.status}`);
const progressData = await response.json();
setProgress(progressData);
if (progressData.status === "completed") {
clearInterval(pollInterval);
setIsSearching(false);
setHasResults(true);
setPersonData(progressData.result);
setCurrentSearchId(searchId);
// Initialize chatbot with welcome message
setChatMessages([{
id: Date.now(),
type: 'bot',
message: `Hi! I've analyzed the research data for ${formData.name}. I can answer questions about their background, timeline, public presence, or any specific information you'd like to know!`,
timestamp: new Date().toISOString()
 }]);
toast({
title: "Search Completed",
description: `Successfully found information for ${formData.name}`,
 });
 } else if (progressData.status === "error") {
clearInterval(pollInterval);
setIsSearching(false);
setProgress({ ...progressData, percentage: 0 });
toast({
title: "Search Failed",
description: progressData.error || "An unknown error occurred.",
variant: "destructive",
 });
 }
 } catch (error) {
clearInterval(pollInterval);
setIsSearching(false);
setProgress({
percentage: 0,
stage: "Connection error",
status: "error",
 });
toast({
title: "Connection Error",
description: "Unable to connect to the server.",
variant: "destructive",
 });
 }
 }, 1000);
 };

const handleSearch = async () => {
setIsSearching(true);
setHasResults(false);
setPersonData(null);
setCurrentSearchId(null);
setChatMessages([]);
setIsChatbotOpen(false);
setProgress({
percentage: 0,
stage: "Initiating search...",
status: "running",
 });

try {
const response = await fetch(`${API_BASE_URL}/osint`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(formData),
 });

if (!response.ok) {
const errorData = await response
 .json()
 .catch(() => ({ error: "An unknown server error occurred." }));
throw new Error(
errorData.error || `HTTP error! status: ${response.status}`
 );
 }

const data = await response.json();
if (data.searchId) {
pollProgress(data.searchId);
 } else {
throw new Error("Did not receive a valid search ID from the server.");
 }
 } catch (error) {
setIsSearching(false);
setProgress({ percentage: 0, stage: "Search failed", status: "error" });
toast({
title: "Search Failed",
description: error.message,
variant: "destructive",
 });
 }
 };

const startNewSearch = () => {
setHasResults(false);
setPersonData(null);
setCurrentSearchId(null);
setChatMessages([]);
setIsChatbotOpen(false);
setFormData({ name: "", city: "", extraTerms: "" });
 };

// Chatbot functions
const sendQuestion = async () => {
if (!currentQuestion.trim() || !currentSearchId || isAskingQuestion) return;

const userMessage = {
id: Date.now(),
type: 'user',
message: currentQuestion.trim(),
timestamp: new Date().toISOString()
 };

setChatMessages(prev => [...prev, userMessage]);
setCurrentQuestion("");
setIsAskingQuestion(true);

// Add loading message
const loadingMessage = {
id: Date.now() + 1,
type: 'bot',
message: "🤔 Thinking...",
timestamp: new Date().toISOString(),
isLoading: true
 };
setChatMessages(prev => [...prev, loadingMessage]);

try {
const response = await fetch(`${API_BASE_URL}/chat/${currentSearchId}`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ question: userMessage.message })
 });

if (!response.ok) {
throw new Error(`Server error: ${response.status}`);
 }

const data = await response.json();
 
// Remove loading message and add actual response
setChatMessages(prev => {
const withoutLoading = prev.filter(msg => !msg.isLoading);
return [...withoutLoading, {
id: Date.now() + 2,
type: 'bot',
message: data.answer || "Sorry, I couldn't process your question.",
timestamp: new Date().toISOString()
 }];
 });

 } catch (error) {
// Remove loading message and add error response
setChatMessages(prev => {
const withoutLoading = prev.filter(msg => !msg.isLoading);
return [...withoutLoading, {
id: Date.now() + 2,
type: 'bot',
message: "Sorry, I encountered an error while processing your question. Please try again.",
timestamp: new Date().toISOString()
 }];
 });
toast({
title: "Chat Error",
description: "Failed to get response from chatbot",
variant: "destructive",
 });
 } finally {
setIsAskingQuestion(false);
 }
 };

const handleKeyPress = (e) => {
if (e.key === 'Enter' && !e.shiftKey) {
e.preventDefault();
sendQuestion();
 }
 };

// --- Data for Chart ---
const chartData =
personData?.sourceAnalysis?.map((source) => ({
subject: source.name,
A: source.count,
fullMark:
Math.max(...personData.sourceAnalysis.map((s) => s.count), 0) + 5,
 })) || [];

return (
<div className="min-h-screen bg-gray-900 text-white relative overflow-hidden p-4 sm:p-8 font-sans">
<div
className="absolute inset-0 opacity-20"
style={{
backgroundImage: `radial-gradient(circle at center, rgba(167, 139, 250, 0.3), transparent 60%), linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)`,
backgroundSize: "100% 100%, 40px 40px, 40px 40px",
 }}
/>

{!hasResults && (
<div className="absolute top-6 left-6 z-20">
<Button
onClick={() => navigate("/")}
className="bg-gray-900/60 backdrop-blur-sm border border-purple-400/30 hover:bg-gray-800/60 text-purple-200"
>
<ArrowLeft className="w-5 h-5 mr-2" />
 Back to Home
</Button>
</div>
 )}

{/* Chatbot Toggle Button - Only show when results are available */}
{hasResults && personData && !isChatbotOpen && (
<motion.div
initial={{ scale: 0 }}
animate={{ scale: 1 }}
className="fixed bottom-6 right-6 z-50"
>
<Button
onClick={() => setIsChatbotOpen(true)}
className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 shadow-2xl shadow-purple-500/20"
>
<MessageCircle className="w-8 h-8" />
</Button>
</motion.div>
 )}

{/* Chatbot Interface */}
<AnimatePresence>
{isChatbotOpen && (
<motion.div
initial={{ opacity: 0, scale: 0.8, y: 100 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.8, y: 100 }}
className={`fixed z-50 bg-gray-900/95 backdrop-blur-md border border-purple-400/30 rounded-2xl shadow-2xl ${
isChatbotMaximized 
? 'inset-4' 
: 'bottom-6 right-6 w-96 h-[32rem]'
 }`}
>
{/* Chatbot Header */}
<div className="flex items-center justify-between p-4 border-b border-purple-400/20">
<div className="flex items-center space-x-3">
<div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
<Bot className="w-6 h-6 text-white" />
</div>
<div>
<h3 className="font-semibold text-purple-200">OSINT Assistant</h3>
<p className="text-xs text-purple-300/70">Ask me about {personData?.name}</p>
</div>
</div>
<div className="flex items-center space-x-2">
<Button
variant="ghost"
size="sm"
onClick={() => setIsChatbotMaximized(!isChatbotMaximized)}
className="text-purple-300 hover:text-purple-200"
>
{isChatbotMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
</Button>
<Button
variant="ghost"
size="sm"
onClick={() => setIsChatbotOpen(false)}
className="text-purple-300 hover:text-purple-200"
>
<X className="w-4 h-4" />
</Button>
</div>
</div>

{/* Chat Messages */}
<div 
ref={chatMessagesRef}
className="flex-1 overflow-y-auto p-4 space-y-4"
style={{ height: isChatbotMaximized ? 'calc(100vh - 200px)' : '400px' }}
>
{chatMessages.map((message) => (
<div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
<div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
<div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
message.type === 'user' 
? 'bg-blue-500' 
: 'bg-gradient-to-r from-purple-500 to-violet-600'
 }`}>
{message.type === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
</div>
<div className={`rounded-2xl px-4 py-2 ${
message.type === 'user'
? 'bg-blue-500 text-white'
: 'bg-gray-800/60 text-purple-100 border border-purple-400/20'
 }`}>
{message.isLoading ? (
<div className="flex items-center space-x-2">
<Loader2 className="w-4 h-4 animate-spin" />
<span>Thinking...</span>
</div>
 ) : (
<p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
 )}
</div>
</div>
</div>
 ))}
</div>

{/* Chat Input */}
<div className="p-4 border-purple-400/20">
  <div className="flex space-x-1">
    <Input
      value={currentQuestion}
      onChange={(e) => setCurrentQuestion(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Ask me anything about this person..."
      disabled={isAskingQuestion}
      className=" bg-gray-800 border-purple-400/40 text-purple-100 focus:border-purple-400"
    />
    <Button
      onClick={sendQuestion}
      disabled={!currentQuestion.trim() || isAskingQuestion}
      className="bg-gradient-to-r from-purple-800 to-violet-900 hover:from-purple-400 hover:to-violet-500"
    >
      {isAskingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
    </Button>
  </div>
</div>
</motion.div>
 )}
</AnimatePresence>

<div className="relative z-10 flex flex-col items-center justify-center w-full">
<AnimatePresence mode="wait">
{/* --- SEARCH VIEW --- */}
{!isSearching && !hasResults && (
<motion.div
key="search"
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
className="w-full max-w-4xl"
>
<Card className="bg-gray-900/70 backdrop-blur-md border border-purple-400/30 p-12 shadow-2xl shadow-purple-500/10">
<CardHeader className="text-center p-0 mb-8">
<h1 className="text-5xl font-bold text-purple-300">
 OSINT Intelligence Terminal
</h1>
<p className="text-purple-200/70 text-xl mt-3">
 Enter target parameters to begin investigation
</p>
</CardHeader>
<CardContent className="p-0 space-y-8">
<div>
<Label
htmlFor="name"
className="text-purple-200 mb-3 block text-lg"
>
 Full Name
</Label>
<Input
id="name"
value={formData.name}
onChange={(e) =>
setFormData({ ...formData, name: e.target.value })
}
className="bg-gray-800/60 border-purple-400/40 text-purple-100 focus:border-purple-400 p-4 text-xl"
placeholder="e.g., John Doe"
/>
</div>
<div>
<Label
htmlFor="city"
className="text-purple-200 mb-3 block text-lg"
>
 City / Region
</Label>
<Input
id="city"
value={formData.city}
onChange={(e) =>
setFormData({ ...formData, city: e.target.value })
}
className="bg-gray-800/60 border-purple-400/40 text-purple-100 focus:border-purple-400 p-4 text-xl"
placeholder="e.g., New York"
/>
</div>
<div>
<Label
htmlFor="extraTerms"
className="text-purple-200 mb-3 block text-lg"
>
 Additional Keywords
</Label>
<Input
id="extraTerms"
value={formData.extraTerms}
onChange={(e) =>
setFormData({ ...formData, extraTerms: e.target.value })
}
className="bg-gray-800/60 border-purple-400/40 text-purple-100 focus:border-purple-400 p-4 text-xl"
placeholder="e.g., CEO, TechCorp, lawsuit"
/>
</div>
<Button
onClick={handleSearch}
disabled={!formData.name}
className="w-full !mt-10 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold py-4 text-xl rounded-lg"
>
<Search className="w-6 h-6 mr-3" />
 Initiate Search
</Button>
</CardContent>
</Card>
</motion.div>
 )}

{/* --- LOADING VIEW --- */}
{isSearching && (
<motion.div
key="loading"
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
className="w-full max-w-2xl"
>
<Card className="bg-gray-900/60 backdrop-blur-sm border border-purple-400/30 p-8 text-center">
<motion.div
key={currentQuote}
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 1 }}
className="text-purple-200 text-lg italic mb-4"
>
 "{osintQuotes[currentQuote]}"
</motion.div>
<Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
<p className="text-purple-300/80 mb-6">
 Processing your request...
</p>
{progress.stage && (
<div className="space-y-3 text-left">
<div className="flex justify-between items-center text-sm">
<span className="text-purple-200">{progress.stage}</span>
<span className="text-purple-400 font-bold">
{Math.round(progress.percentage)}%
</span>
</div>
<div className="w-full bg-gray-800/60 rounded-full h-2.5">
<motion.div
className="h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-violet-600"
animate={{ width: `${progress.percentage}%` }}
/>
</div>
</div>
 )}
</Card>
</motion.div>
 )}

{/* --- RESULTS VIEW --- */}
{hasResults && personData && (
<motion.div
key="results"
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
className="w-full max-w-7xl"
>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
<div className="lg:col-span-2 space-y-8">
<Card className="bg-gray-900/70 backdrop-blur-md border border-purple-400/30">
<CardHeader>
<CardTitle className="flex items-center text-3xl text-purple-300">
<User className="w-8 h-8 mr-4" />
{personData.name}
</CardTitle>
<CardDescription className="text-purple-200/60">
 Intelligence Dossier | Location Context:{" "}
{personData.location}
</CardDescription>
</CardHeader>
<CardContent className="space-y-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<Card className="bg-black/20 p-4 border-purple-400/20">
<CardHeader className="p-0 flex flex-row items-center justify-between">
<CardTitle className="text-base text-purple-200/80">
 Risk Score
</CardTitle>
<ShieldAlert className="w-5 h-5 text-purple-400" />
</CardHeader>
<CardContent className="p-0 mt-2">
<p
className={`text-5xl font-bold ${getRiskColor(
personData.riskAnalysis?.riskScore
 )}`}
>
{personData.riskAnalysis?.riskScore}/10
</p>
<p className="text-xs text-gray-400 mt-1">
{personData.riskAnalysis?.riskJustification}
</p>
</CardContent>
</Card>
<Card className="bg-black/20 p-4 border-purple-400/20">
<CardHeader className="p-0 flex flex-row items-center justify-between">
<CardTitle className="text-base text-purple-200/80">
 Public Sentiment
</CardTitle>
<TrendingUp className="w-5 h-5 text-purple-400" />
</CardHeader>
<CardContent className="p-0 mt-2">
<p
className={`text-5xl font-bold ${getSentimentColor(
personData.riskAnalysis?.sentimentScore
 )}`}
>
{personData.riskAnalysis?.sentimentScore.toFixed(
2
 )}
</p>
<p className="text-xs text-gray-400 mt-1">
{personData.riskAnalysis?.sentimentJustification}
</p>
</CardContent>
</Card>
</div>
<div className="space-y-2">
<h4 className="font-semibold text-purple-200/70 text-sm">
 AI-Generated Summary
</h4>
<motion.div className="text-purple-100/90 leading-relaxed bg-black/20 p-4 rounded-md border border-purple-400/20 text-base overflow-hidden">
<p>
<strong>Executive Summary:</strong>{" "}
{personData.short_summary}
</p>
<AnimatePresence>
{isSummaryExpanded && (
<motion.div
initial={{
opacity: 0,
height: 0,
marginTop: 0,
 }}
animate={{
opacity: 1,
height: "auto",
marginTop: "16px",
 }}
exit={{ opacity: 0, height: 0, marginTop: 0 }}
transition={{
duration: 0.4,
ease: "easeInOut",
 }}
>
<p>
<strong>Detailed Analysis:</strong>{" "}
{personData.detailed_summary}
</p>
</motion.div>
 )}
</AnimatePresence>
</motion.div>
<Button
variant="link"
onClick={() =>
setIsSummaryExpanded(!isSummaryExpanded)
}
className="text-purple-300 p-0 h-auto"
>
{isSummaryExpanded
? "Show Less"
: "Show Detailed Analysis..."}
</Button>
</div>
</CardContent>
</Card>
<Card className="bg-gray-900/70 backdrop-blur-md border border-purple-400/30">
<CardHeader>
<CardTitle className="flex items-center text-2xl text-purple-300">
<CalendarClock className="w-6 h-6 mr-3" />
 Evidence Timeline
</CardTitle>
<CardDescription className="text-purple-200/60">
 Chronological events extracted from data sources.
</CardDescription>
</CardHeader>
<CardContent className="relative pl-6">
{personData.timelineEvents &&
personData.timelineEvents.length > 0 ? (
<>
<div className="absolute left-8 top-0 bottom-0 w-0.5 bg-purple-400/30"></div>
<div className="space-y-8">
{personData.timelineEvents.map((event, index) => (
<div
key={index}
className="relative flex items-start"
>
<div className="absolute left-0 top-1.5 flex items-center justify-center w-5 h-5 bg-gray-800 rounded-full border-2 border-purple-400">
<div
className={`w-2 h-2 rounded-full ${getSourceColor(
event.source
 )}`}
></div>
</div>
<div className="ml-12">
<p className="font-bold text-purple-200">
{event.date}
</p>
<p className="text-purple-100/90">
{event.title}
</p>
<p
className={`text-xs font-semibold px-2 py-0.5 mt-1 inline-block rounded-full text-white ${getSourceColor(
event.source
 )}`}
>
{event.source}
</p>
</div>
</div>
 ))}
</div>
</>
 ) : (
<div className="flex items-center justify-center h-24 text-center">
<p className="text-purple-200/70">
 No chronological events could be extracted from the
 data sources.
</p>
</div>
 )}
</CardContent>
</Card>
<Card className="bg-gray-900/70 backdrop-blur-md border border-purple-400/30">
<CardHeader>
<CardTitle className="flex items-center text-2xl text-purple-300">
<Database className="w-6 h-6 mr-3" />
 Raw Intelligence Data
</CardTitle>
<CardDescription className="text-purple-200/60">
 The complete list of data points gathered for this
 search.
</CardDescription>
</CardHeader>
<CardContent className="max-h-96 overflow-y-auto space-y-4 pr-4">
{personData.raw_data && personData.raw_data.length > 0 ? (
personData.raw_data.map((item, index) => (
<div
key={index}
className="p-4 bg-black/20 rounded-lg border border-purple-400/20"
>
<h3 className="font-bold text-purple-200">
{item.title}
</h3>
<p className="text-sm text-purple-100/80 mt-1">
{item.snippet}
</p>
<div className="mt-2 flex justify-between items-center">
<a
href={item.link}
target="_blank"
rel="noopener noreferrer"
className="text-xs text-purple-400 hover:underline"
>
 View Source
</a>
<span
className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${getSourceColor(
item.source
 )}`}
>
{item.source}
</span>
</div>
</div>
 ))
 ) : (
<p className="text-purple-200/70 text-center">
 No raw data available.
</p>
 )}
</CardContent>
</Card>
</div>
<div className="space-y-8">
<Card className="bg-gray-900/70 backdrop-blur-md border border-purple-400/30">
<CardHeader>
<CardTitle className="flex items-center text-xl text-purple-300">
<BarChart className="w-5 h-5 mr-3" />
 Source Analysis
</CardTitle>
<CardDescription className="text-purple-200/60">
 Volume of findings across data sources.
</CardDescription>
</CardHeader>
<CardContent>
<ResponsiveContainer width="100%" height={300}>
<RadarChart
cx="50%"
cy="50%"
outerRadius="70%"
data={chartData}
margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
>
<PolarGrid stroke="rgba(167, 139, 250, 0.2)" />
<PolarAngleAxis
dataKey="subject"
stroke="rgba(224, 204, 255, 0.7)"
tickLine={false}
/>
<PolarRadiusAxis
angle={30}
                domain={[0, "dataMax + 5"]}
                tick={false}
                axisLine={false}
/>
<Radar
name="Findings"
dataKey="A"
stroke="#a78bfa"
fill="#8b5cf6"
fillOpacity={0.6}
/>
<Tooltip
contentStyle={{
backgroundColor: "rgba(30, 30, 40, 0.9)",
borderColor: "rgba(136, 132, 216, 0.5)",
 }}
/>
<Legend />
</RadarChart>
</ResponsiveContainer>
</CardContent>
</Card>
<div className="grid grid-cols-2 gap-4">
<Button
onClick={startNewSearch}
className="w-full bg-gray-700 hover:bg-gray-600 text-purple-200 font-bold py-3"
>
<Search className="w-5 h-5 mr-2" />
 New Search
</Button>
<Button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 text-white font-bold py-3">
<FileText className="w-5 h-5 mr-2" />
 Generate Report
</Button>
</div>

{/* AI Chat Assistant Card */}
<Card className="bg-gray-900/70 backdrop-blur-md border border-purple-400/30">
<CardHeader>
<CardTitle className="flex items-center text-xl text-purple-300">
<MessageCircle className="w-5 h-5 mr-3" />
 AI Assistant
</CardTitle>
<CardDescription className="text-purple-200/60">
 Ask questions about the research findings
</CardDescription>
</CardHeader>
<CardContent className="text-center py-8">
<div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
<Bot className="w-8 h-8 text-white" />
</div>
<p className="text-purple-200/80 mb-4">
 I can help answer questions about {personData.name}'s research data
</p>
<Button
onClick={() => setIsChatbotOpen(true)}
className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold"
>
<MessageCircle className="w-4 h-4 mr-2" />
 Start Chat
</Button>
</CardContent>
</Card>
</div>
</div>
</motion.div>
 )}
</AnimatePresence>
</div>
</div>
 );
};

export default SearchPage;