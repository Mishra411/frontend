import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { 
  Home as HomeIcon, LayoutDashboard, BarChart2, FileText, Menu, X, TrendingUp, BookOpen, 
  MapPin, Calendar, User, Clock, Eye, Wrench, CheckCircle, XCircle, Search, 
  Upload, Loader2, AlertCircle, TrendingDown, Clock3
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { format, parseISO } from "date-fns";
import { API_BASE_URL } from "./config";

function App() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all reports
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/reports`);
      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Add new report
  const addReport = async (reportData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });
      if (!response.ok) throw new Error("Failed to add report");
      fetchReports(); // refresh after add
    } catch (err) {
      setError(err.message);
    }
  };

  // Update report
  const updateReport = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error("Failed to update report");
      fetchReports();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete report
  const deleteReport = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete report");
      fetchReports();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="app-container">
      <h1>Reports Dashboard</h1>

      <ReportFilter />
      <ReportForm onSubmit={addReport} />
      <StationSelector />

      <div className="reports-list">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onUpdate={updateReport}
            onDelete={deleteReport}
          >
            <StatusBadge status={report.status} />
          </ReportCard>
        ))}
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

// =========================================================================
// 1. ENVIRONMENT & UTILITY FUNCTIONS (Replacing lib/utils and .env)
// =========================================================================

// API Base URL (Replacing .env setup)
// Since this is a single file execution environment, VITE_API_BASE_URL is replaced
// with the hardcoded URL from your .env file.
const API_BASE_URL = "http://L-backend.up.railway.app"; 

// Simple class name merger (Replacing '@/lib/utils/cn')
const cn = (...classes) => classes.filter(Boolean).join(' ');

// =========================================================================
// 2. MINIMAL SHADCN-STYLE UI COMPONENTS (Replacing '@/components/ui/*')
// =========================================================================

// --- Card Components ---
const Card = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={cn("bg-white border rounded-xl shadow-md", className)}>
    {children}
  </div>
);
const CardHeader = ({ children, className = '' }) => (
  <div className={cn("p-6 flex flex-col space-y-1.5", className)}>
    {children}
  </div>
);
const CardContent = ({ children, className = '' }) => (
  <div className={cn("p-6 pt-0", className)}>
    {children}
  </div>
);
const CardTitle = ({ children, className = '' }) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>
    {children}
  </h3>
);
const CardDescription = ({ children, className = '' }) => (
  <p className={cn("text-sm text-slate-500", className)}>
    {children}
  </p>
);

// --- Input/Form Components ---
const Label = ({ htmlFor, children, className = '' }) => (
  <label htmlFor={htmlFor} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-1", className)}>
    {children}
  </label>
);
const Input = ({ className = '', type = 'text', ...props }) => (
  <input type={type} className={cn("flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
);
const Textarea = ({ className = '', ...props }) => (
  <textarea className={cn("flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
);
const Button = ({ children, className = '', variant = 'default', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  let variantClasses = "bg-slate-900 text-white hover:bg-slate-700"; // default
  if (variant === 'destructive') variantClasses = "bg-red-600 text-white hover:bg-red-700";
  if (variant === 'outline') variantClasses = "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900";

  return (
    <button className={cn(baseClasses, variantClasses, className)} {...props}>
      {children}
    </button>
  );
};
const Badge = ({ children, className = '' }) => (
  <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", className)}>
    {children}
  </span>
);
const Alert = ({ children, variant, className = '' }) => {
  let variantClasses = "border-slate-200 text-slate-900 bg-white"; // default
  if (variant === 'destructive') variantClasses = "border-red-500 bg-red-50 text-red-800";
  return (
    <div role="alert" className={cn("relative w-full rounded-lg border p-4", variantClasses, className)}>
      {children}
    </div>
  );
};
const AlertDescription = ({ children, className = '' }) => (
  <div className={cn("text-sm [&_p]:leading-relaxed", className)}>
    {children}
  </div>
);
const Skeleton = ({ className = '' }) => (
  <div className={cn("animate-pulse rounded-md bg-slate-200", className)} />
);

// --- Select Components (Simplified) ---
// Note: This simplified version uses a native <select> element for functional stability.
const SelectTrigger = ({ children, className = '', id, ...props }) => (
  <select id={id} className={cn("flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500", className)} {...props}>
    {children}
  </select>
);
const SelectValue = ({ placeholder }) => <option value="" disabled>{placeholder}</option>;
const SelectContent = ({ children, className = '' }) => <>{children}</>;
const SelectItem = ({ children, value }) => <option value={value}>{children}</option>;
const Select = ({ value, onValueChange, children, ...props }) => {
  const trigger = React.Children.toArray(children).find(child => child.type === SelectTrigger);
  const content = React.Children.toArray(children).find(child => child.type === SelectContent);
  
  if (!trigger || !content) {
    console.error("Select component must have SelectTrigger and SelectContent children.");
    return null;
  }

  // Clone the trigger to inject value and onChange handler
  const triggerProps = {
    value: value || '',
    onChange: (e) => onValueChange(e.target.value),
    ...trigger.props
  };

  return (
    <SelectTrigger {...triggerProps}>
      {trigger.props.children}
      {content.props.children}
    </SelectTrigger>
  );
};

// =========================================================================
// 3. API FUNCTIONS (Replacing src/api/reportApi.js)
// =========================================================================

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorDetail = await res.text();
    throw new Error(`API Error: ${res.status} - ${errorDetail || res.statusText}`);
  }
  // Check if response is JSON before parsing
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  // Return text for non-JSON responses
  return res.text();
};

/**
 * Fetches reports, accepting all backend filter and sort parameters.
 */
export const listReports = async (params = {}) => {
  const url = new URL(`${API_BASE_URL}/reports`);
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
      url.searchParams.append(key, params[key]);
    }
  });
  const res = await fetch(url.toString());
  return handleResponse(res);
};

/**
 * Fetches calculated statistics from the dedicated backend endpoint for Analytics.
 */
export const getStats = async () => {
  const res = await fetch(`${API_BASE_URL}/reports/stats`);
  return handleResponse(res);
};

/**
 * Fetches a single report by ID.
 */
export const getReport = async (id) => {
  const res = await fetch(`${API_BASE_URL}/reports/${id}`);
  return handleResponse(res);
};

/**
 * Updates a report's status and inspector notes (PATCH request).
 */
export const updateReport = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/reports/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

/**
 * Submits a new report, including file upload (multipart/form-data).
 */
export const submitReport = async (formData) => {
  const res = await fetch(`${API_BASE_URL}/reports`, {
    method: 'POST',
    body: formData, // fetch will automatically set Content-Type: multipart/form-data
  });
  return handleResponse(res);
};

// --- Auth Functions (included for completeness, though not used in UI) ---
export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return handleResponse(res);
}
export async function registerUser(username, password, role="customer") {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role })
  });
  return handleResponse(res);
}

// =========================================================================
// 4. COMPONENT LOGIC (Replacing Components/reports/*.js)
// =========================================================================

// --- StationSelector (from StationSelector.js) ---
const STATIONS = {
  Edmonton: [
    "Clareview", "Belvedere", "Coliseum", "Stadium", "Churchill", "Central", 
    "Bay/Enterprise Square", "Corona", "Grandin/Government Centre", "University", 
    "Health Sciences", "McKernan/Belgravia", "South Campus/Fort Edmonton Park", 
    "Southgate", "Century Park", "Mill Woods"
  ],
  Calgary: [
    "Tuscany", "Crowfoot", "Dalhousie", "Brentwood", "University", "Banff Trail", 
    "Lions Park", "SAIT/ACAD/Jubilee", "Sunnyside", "Centre Street", "City Hall", 
    "Victoria Park/Stampede", "Erlton/Stampede", "39 Avenue", "Chinook", "Heritage", 
    "Southland", "Anderson", "Canyon Meadows", "Fish Creek-Lacombe", "Somerset-Bridlewood"
  ]
};

const StationSelector = ({ city, station, onCityChange, onStationChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="city">City</Label>
        <Select value={city} onValueChange={onCityChange}>
          <SelectTrigger id="city">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Edmonton">Edmonton</SelectItem>
            <SelectItem value="Calgary">Calgary</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {city && (
        <div>
          <Label htmlFor="station">Station</Label>
          <Select value={station} onValueChange={onStationChange}>
            <SelectTrigger id="station">
              <SelectValue placeholder="Select station" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {STATIONS[city].map((stationName) => (
                <SelectItem key={stationName} value={stationName}>
                  {stationName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

// --- StatusBadge and UrgencyBadge (from StatusBadge.js) ---
const STATUS_CONFIG = {
  "Submitted": { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock3 },
  "Under Review": { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Eye },
  "In Progress": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Wrench },
  "Resolved": { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  "Closed": { color: "bg-slate-100 text-slate-800 border-slate-200", icon: XCircle }
};
const URGENCY_CONFIG = {
  "Low": "bg-slate-100 text-slate-700 border-slate-200",
  "Medium": "bg-blue-100 text-blue-700 border-blue-200",
  "High": "bg-orange-100 text-orange-700 border-orange-200",
  "Critical": "bg-red-100 text-red-700 border-red-200"
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { ...STATUS_CONFIG["Submitted"], icon: Clock3 };
  const Icon = config.icon;
  return (
    <Badge  
      className={cn("border", config.color)}  
      title={status || "Submitted"}
    >
      <Icon className="w-3 h-3 mr-1" />
      {status || "Submitted"}
    </Badge>
  );
}

const UrgencyBadge = ({ urgency }) => {
  const colorClass = URGENCY_CONFIG[urgency] || URGENCY_CONFIG["Medium"];
  return (
    <Badge  
      className={cn("border", colorClass)}  
      title={urgency || "Medium"}
    >
      {urgency || "Medium"}
    </Badge>
  );
}

// --- ReportCard (from ReportCard.js) ---
const ReportCard = ({ report, onClick }) => {
  if (!report) return null; // safety check

  const {
    station_name = "Unknown Station",
    station_city = "",
    issue_category = "Issue",
    description = "",
    photo_url,
    status = "Submitted",
    urgency_level = "Medium",
    created_date,
    created_by
  } = report;

  // Construct the full, absolute URL for the photo
  const fullPhotoUrl = photo_url ? `${API_BASE_URL}${photo_url}` : null;

  return (
    <Card
      className="hover:shadow-lg transition-all cursor-pointer border-slate-200"
      onClick={() => onClick(report)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{station_name}, {station_city}</span>
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">{issue_category}</h3>
          </div>
          {fullPhotoUrl && (
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                <img
                  src={fullPhotoUrl}  
                  alt="Issue"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/CCCCCC/333333?text=Photo+Error"; }}
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-slate-600 text-sm line-clamp-2">{description}</p>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={status} />
          <UrgencyBadge urgency={urgency_level} />
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
          {created_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(parseISO(created_date), "MMM d, yyyy")}
            </div>
          )}
          {created_by && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {created_by.includes("@") ? created_by.split("@")[0] : created_by}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// --- ReportFilters (from ReportFilters.js) ---
const CITIES = ["Edmonton", "Calgary"];
const STATUSES = ["Submitted", "Under Review", "In Progress", "Resolved", "Closed"];
const URGENCIES = ["Critical", "High", "Medium", "Low"];

const ReportFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Search Input */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search stations or descriptions..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>
      {/* Status Filter */}
      <Select
        value={filters.status || "all"}
        onValueChange={(value) => onFilterChange({ ...filters, status: value === "all" ? null : value })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status}>{status}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Urgency Filter */}
      <Select
        value={filters.urgency || "all"}
        onValueChange={(value) => onFilterChange({ ...filters, urgency: value === "all" ? null : value })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Urgency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Urgency</SelectItem>
          {URGENCIES.map((urgency) => (
            <SelectItem key={urgency} value={urgency}>{urgency}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* City Filter */}
      <Select
        value={filters.city || "all"}
        onValueChange={(value) => onFilterChange({ ...filters, city: value === "all" ? null : value })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cities</SelectItem>
          {CITIES.map((city) => (
            <SelectItem key={city} value={city}>{city}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// --- ReportForm (from ReportForm.js) ---
const ISSUE_CATEGORIES = [
  "Slippery Surface", "Blocked Access", "Broken Elevator", "Lighting Issue", 
  "Vandalism", "Safety Concern", "Other"
];
const URGENCY_LEVELS = ["Low", "Medium", "High", "Critical"];

const ReportForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    station_city: "",
    station_name: "",
    issue_category: "",
    description: "",
    urgency_level: "Medium",
    reporter_contact: ""
  });
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: ({ reportData, photo }) => {
      const payload = new FormData();
      Object.keys(reportData).forEach(key => {
        if (reportData[key] !== null) {
          payload.append(key, reportData[key]);
        }
      });
      if (photo) {
        payload.append('photo', photo);
      }
      return submitReport(payload);
    },
    onSuccess: () => {
      setFormData({
        station_city: "",
        station_name: "",
        issue_category: "",
        description: "",
        urgency_level: "Medium",
        reporter_contact: ""
      });
      setPhoto(null);
      setError(null);
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Report submission failed:", err);  
      setError(`Failed to submit report. Details: ${err.message || 'Unknown Error'}.`);
    }
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }
    setPhoto(file);
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.station_city || !formData.station_name || !formData.issue_category || !formData.description) {
        setError("Please fill in all required fields (marked with *).");
        return;
    }

    const reportPayload = {  
      ...formData,  
      status: "Submitted",
      latitude: null,  
      longitude: null  
    };

    const submitAction = (data) => mutation.mutate({ reportData: data, photo });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          reportPayload.latitude = position.coords.latitude;
          reportPayload.longitude = position.coords.longitude;
          submitAction(reportPayload);
        },
        () => {
          submitAction(reportPayload);
        }
      );
    } else {
      submitAction(reportPayload);
    }
  };

  return (
    <Card className="border-none shadow-xl bg-white">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-xl">
        <CardTitle className="text-2xl">Report an Issue</CardTitle>
        <CardDescription className="text-orange-50">
          Help us improve LRT accessibility and safety
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className='ml-6'>{error}</p>
              </AlertDescription>
            </Alert>
          )}
          <StationSelector
            city={formData.station_city}
            station={formData.station_name}
            onCityChange={(value) => setFormData({ ...formData, station_city: value, station_name: "" })}
            onStationChange={(value) => setFormData({ ...formData, station_name: value })}
          />
          <div>
            <Label htmlFor="category">Issue Category *</Label>
            <Select
              value={formData.issue_category}
              onValueChange={(value) => setFormData({ ...formData, issue_category: value })}
              required
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="urgency">Urgency Level</Label>
            <Select
              value={formData.urgency_level}
              onValueChange={(value) => setFormData({ ...formData, urgency_level: value })}
            >
              <SelectTrigger id="urgency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {URGENCY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please describe the issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="resize-none"
            />
          </div>
          <div>
            <Label htmlFor="photo">Photo (optional)</Label>
            <div className="mt-2">
              <label
                htmlFor="photo"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
              >
                {photo ? (
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">{photo.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {(photo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Click to upload photo</p>
                    <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  onClick={(e) => e.target.value = null} // Allows selecting same file again
                />
              </label>
            </div>
          </div>
          <div>
            <Label htmlFor="contact">Contact Info (optional)</Label>
            <Input
              id="contact"
              type="text"
              placeholder="Email or phone (if you want updates)"
              value={formData.reporter_contact}
              onChange={(e) => setFormData({ ...formData, reporter_contact: e.target.value })}
            />
          </div>
          <Button
            type="submit"
            disabled={mutation.isLoading || !formData.station_city || !formData.station_name || !formData.issue_category || !formData.description}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            {mutation.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Report...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// =========================================================================
// 5. PAGE COMPONENTS (Replacing src/pages/*.jsx)
// =========================================================================

// --- Home/Default Content (Kept from original App.jsx) ---
const HomeCard = ({ title, value, icon: Icon, color }) => (
  <div className={`p-6 bg-gray-800 rounded-xl shadow-2xl border-l-4 ${color} transition-transform duration-300 hover:scale-[1.02]`}>
    <div className="flex justify-between items-start">
      <Icon className={`w-8 h-8 ${color.replace('border-', 'text-')}`} />
      <div className="text-right">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      </div>
    </div>
  </div>
);

const HomeContent = () => (
  <div className="space-y-8">
    <h2 className="text-3xl font-extrabold text-white">Application Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <HomeCard title="Projects Active" value="14" icon={LayoutDashboard} color="border-orange-500" />
      <HomeCard title="Total Users" value="2,450" icon={TrendingUp} color="border-cyan-500" />
      <HomeCard title="Pending Tasks" value="7" icon={FileText} color="border-red-500" />
      <HomeCard title="New Signups" value="+12" icon={BookOpen} color="border-green-500" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Report Form Area */}
      <div>
        <ReportForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ['reports', 'stats'] })} />
      </div>
      {/* Quick Actions / Info Area */}
      <div className="p-8 bg-gray-800 rounded-xl shadow-2xl h-full">
        <h3 className="text-2xl font-semibold mb-4 text-orange-400">Quick Actions</h3>
        <p className="text-gray-300 mb-6">Submit a new accessibility issue report using the form on the left. All submitted reports appear instantly in the Dashboard.</p>
        <div className="flex flex-wrap gap-4">
          <Button className="px-6 py-2 bg-orange-600 rounded-lg font-medium hover:bg-orange-700 transition-colors">Generate Report</Button>
          <Button className="px-6 py-2 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition-colors">View Analytics</Button>
        </div>
      </div>
    </div>
  </div>
);

// --- Dashboard Content (from original App.jsx, but enhanced) ---
const DashboardContent = () => {
  const [filters, setFilters] = useState({});
  const { data: reports, isLoading, isError } = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => listReports(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });

  const handleReportClick = useCallback((report) => {
    // In a real app, this would navigate to the ReportDetails page.
    // For now, it logs and shows a mock alert.
    console.log("Clicked Report:", report.id);
    alert(`Viewing Report: ${report.id} - ${report.issue_category}`);
  }, []);

  const handleSortChange = (sortValue) => {
      // In a real app, you would pass this to the API.
      // Since we need to avoid complex query constraints (orderBy), we'll sort clientside.
      const newFilters = { ...filters, sort: sortValue };
      setFilters(newFilters);
  };

  const sortedReports = useMemo(() => {
    if (!reports) return [];
    
    // Client-side sort implementation
    return [...reports].sort((a, b) => {
      const sortKey = filters.sort;
      if (!sortKey || sortKey === 'created_date:desc') {
        return new Date(b.created_date) - new Date(a.created_date); // Default: Newest first
      } else if (sortKey === 'urgency_level:desc') {
        const urgencyOrder = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
        return urgencyOrder[b.urgency_level] - urgencyOrder[a.urgency_level];
      }
      return 0;
    });
  }, [reports, filters.sort]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-extrabold text-white">Report Dashboard</h2>
      <p className="text-gray-300 mt-4">Browse and filter reported accessibility issues.</p>
      
      {/* Filters and Sorting */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
        <ReportFilters filters={filters} onFilterChange={setFilters} />
        <div className="flex justify-end mt-3">
          <Select
              value={filters.sort || 'created_date:desc'}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_date:desc">Newest First</SelectItem>
                <SelectItem value="urgency_level:desc">Urgency (High to Low)</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </div>

      {/* Report List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-48 bg-gray-800" />
        ))}

        {isError && (
          <div className="col-span-full text-center p-10 bg-red-900/30 rounded-xl text-red-400">
            Error loading reports. Check API connection.
          </div>
        )}

        {sortedReports.length > 0 ? (
          sortedReports.map((report) => (
            <ReportCard key={report.id} report={report} onClick={handleReportClick} />
          ))
        ) : (
          !isLoading && !isError && (
            <div className="col-span-full text-center p-10 bg-gray-800 rounded-xl text-gray-400">
              No reports match the current filters.
            </div>
          )
        )}
      </div>
    </div>
  );
};

// --- Analytics Content (Reconstructed from truncated Analytics.jsx) ---
const AnalyticsContent = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    staleTime: 60000, // 1 minute cache
  });
  
  const COLORS = ['#f97316', '#ef4444', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#a855f7', '#6366f1'];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64 mb-6 bg-gray-700" />
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {Array(4).fill(0).map((_, i) => (<Skeleton key={i} className="h-32 bg-gray-800" />))}
        </div>
        <Skeleton className="h-[400px] w-full bg-gray-800" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="text-center p-10 bg-red-900/30 rounded-xl text-red-400">
        Error loading analytics data. Check API connection.
      </div>
    );
  }

  // Process API data
  const categoryData = Object.entries(stats.by_category || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const urgencyData = Object.entries(stats.by_urgency || {})
    .map(([name, value]) => ({ name, value }));
  const topStations = (stats.top_stations || []).map(item => ({
    name: item.station,
    value: item.count
  }));
  const cityData = Object.entries(stats.by_city || {})
    .map(([name, value]) => ({ name, value }));
  
  const totalReports = stats.total || 0;
  const resolvedCount = stats.by_status?.['Resolved'] || 0;
  const pendingCount = (stats.by_status?.['Submitted'] || 0) + (stats.by_status?.['Under Review'] || 0);

  const completionRate = totalReports > 0 ? ((resolvedCount / totalReports) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics & Insights</h1>
        <p className="text-gray-400 mt-1">
          Track trends and patterns in accessibility reports
        </p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800 shadow-xl border-t-4 border-cyan-500">
          <CardHeader className='pb-3'>
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium text-gray-400">Total Reports</CardTitle>
              <FileText className="w-6 h-6 text-cyan-500" />
            </div>
            <div className="text-3xl font-bold text-white">{totalReports}</div>
          </CardHeader>
        </Card>
        <Card className="bg-gray-800 shadow-xl border-t-4 border-red-500">
          <CardHeader className='pb-3'>
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium text-gray-400">Reports Pending</CardTitle>
              <Clock3 className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-white">{pendingCount}</div>
          </CardHeader>
        </Card>
        <Card className="bg-gray-800 shadow-xl border-t-4 border-green-500">
          <CardHeader className='pb-3'>
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium text-gray-400">Reports Resolved</CardTitle>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-white">{resolvedCount}</div>
          </CardHeader>
        </Card>
        <Card className="bg-gray-800 shadow-xl border-t-4 border-orange-500">
          <CardHeader className='pb-3'>
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium text-gray-400">Completion Rate</CardTitle>
              <TrendingUp className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-white">{completionRate}%</div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart 1: Top Stations */}
        <Card className="lg:col-span-2 bg-gray-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Top 5 Stations by Reports</CardTitle>
            <CardDescription className="text-gray-400">Stations requiring the most attention.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topStations} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`${value} Reports`, 'Count']}
                />
                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Urgency Distribution */}
        <Card className="bg-gray-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Urgency Distribution</CardTitle>
            <CardDescription className="text-gray-400">Breakdown by urgency level.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={urgencyData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: '#9ca3af' }}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Issue Category */}
        <Card className="lg:col-span-3 bg-gray-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Reports by Issue Category</CardTitle>
            <CardDescription className="text-gray-400">Most common types of reported issues.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} angle={-30} textAnchor="end" height={60} />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`${value} Reports`, 'Count']}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// --- Reports Content (from original App.jsx) ---
const ReportsContent = () => {
  const { id } = useParams();

  // Fetch single report data (keeping the feature alive)
  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['report', id],
    queryFn: () => getReport(id),
    enabled: !!id, // Only run if id is present
  });

  return (
    <div className="p-6 bg-gray-800 rounded-xl shadow-2xl space-y-4">
      <h2 className="text-3xl font-extrabold text-white">Report Details Viewer</h2>
      <p className="text-gray-300">Viewing Report ID: <span className='font-mono text-orange-400'>{id}</span></p>
      
      {isLoading && <p className="text-gray-400">Loading report details...</p>}
      {isError && <p className="text-red-400">Error fetching report {id}. (Check console for API error)</p>}
      
      {report && (
        <Card className="bg-gray-700 border-none">
          <CardHeader>
            <CardTitle className='text-white'>{report.issue_category}</CardTitle>
            <CardDescription className='text-gray-400'>
              {report.station_name} ({report.station_city}) - <StatusBadge status={report.status} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-gray-300'>{report.description}</p>
            <div className='mt-4 flex gap-4 text-sm text-gray-400'>
              <p>Urgency: <UrgencyBadge urgency={report.urgency_level} /></p>
              {report.created_date && <p>Submitted: {format(parseISO(report.created_date), 'PPP')}</p>}
            </div>
            {report.photo_url && (
              <div className='mt-4'>
                <p className='text-sm font-medium text-gray-300 mb-2'>Attached Photo:</p>
                <img 
                  src={`${API_BASE_URL}${report.photo_url}`} 
                  alt="Report Attachment" 
                  className="max-w-xs rounded-lg shadow-md" 
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x200/4B5563/FFFFFF?text=Photo+Not+Available"; }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};


// =========================================================================
// 6. LAYOUT AND APP CORE (Replacing original App.jsx components)
// =========================================================================

// Navigation items for the sidebar
const navItems = [
  { name: 'Report & Home', path: '/', icon: HomeIcon },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'Reports Detail', path: '/report/123', icon: FileText }, // Example link
];

// Reusable Navigation Link Component
const NavItem = ({ item }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center p-3 text-sm font-medium rounded-lg transition-colors duration-200 group 
         ${item.disabled ? 'text-gray-500 cursor-not-allowed' :
          isActive
            ? 'bg-orange-600 text-white shadow-lg'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`
      }
      title={item.name}
      end // Ensures that '/' only matches the home path exactly
    >
      <Icon className="w-5 h-5 mr-3" />
      <span className="truncate">{item.name}</span>
    </NavLink>
  );
};

// Layout Component - Wraps content with sidebar and main area structure
const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 text-white font-inter">
      {/* Mobile Sidebar Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle navigation menu"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out 
          w-64 bg-gray-800 flex flex-col p-4 shadow-2xl z-40`}
      >
        {/* Logo/Title */}
        <div className="flex items-center mb-10 mt-2 border-b border-gray-700 pb-4">
          <BarChart2 className="w-8 h-8 text-orange-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-100">LRT Accessibility</h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2" onClick={() => setIsSidebarOpen(false)}>
          {navItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
        
        {/* Footer/User Info Placeholder */}
        <div className="mt-auto pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400">© 2025 LRT Analytics</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300 ease-in-out md:ml-64">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

// --- Main Application Component ---
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomeContent />} />
            <Route path="/dashboard" element={<DashboardContent />} />
            <Route path="/analytics" element={<AnalyticsContent />} />
            {/* The report path uses a dynamic parameter and fetches data */}
            <Route path="/report/:id" element={<ReportsContent />} /> 
            {/* Fallback route */}
            <Route path="*" element={<HomeContent />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
