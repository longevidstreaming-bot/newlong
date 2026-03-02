import Layout from "./Layout.jsx";

import Home from "./Home";

import Watch from "./Watch";

import Pricing from "./Pricing";

import ArtistDashboard from "./ArtistDashboard";

import UploadVideo from "./UploadVideo";

import PlanSelection from "./PlanSelection";

import Profile from "./Profile";

import AdvertiserDashboard from "./AdvertiserDashboard";

import ArtistProfile from "./ArtistProfile";

import BecomeArtist from "./BecomeArtist";

import ContentModeration from "./ContentModeration";

import AdminArtistApplications from "./AdminArtistApplications";

import AdminAds from "./AdminAds";

import AdminDashboard from "./AdminDashboard";

import PaymentHistory from "./PaymentHistory";

import AuthPage from "./AuthPage";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Watch: Watch,
    
    Pricing: Pricing,
    
    ArtistDashboard: ArtistDashboard,
    
    UploadVideo: UploadVideo,
    
    PlanSelection: PlanSelection,
    
    Profile: Profile,
    
    AdvertiserDashboard: AdvertiserDashboard,
    
    ArtistProfile: ArtistProfile,
    
    BecomeArtist: BecomeArtist,
    
    ContentModeration: ContentModeration,
    
    AdminArtistApplications: AdminArtistApplications,
    
    AdminAds: AdminAds,
    
    AdminDashboard: AdminDashboard,
    
    PaymentHistory: PaymentHistory,
    
    AuthPage: AuthPage,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/home" element={<Home />} />
                
                <Route path="/watch" element={<Watch />} />
                
                <Route path="/pricing" element={<Pricing />} />
                
                <Route path="/artistdashboard" element={<ArtistDashboard />} />
                
                <Route path="/uploadvideo" element={<UploadVideo />} />
                
                <Route path="/planselection" element={<PlanSelection />} />
                
                <Route path="/profile" element={<Profile />} />
                
                <Route path="/advertiserdashboard" element={<AdvertiserDashboard />} />
                
                <Route path="/artistprofile" element={<ArtistProfile />} />
                
                <Route path="/becomeartist" element={<BecomeArtist />} />
                
                <Route path="/contentmoderation" element={<ContentModeration />} />
                
                <Route path="/adminartistapplications" element={<AdminArtistApplications />} />
                
                <Route path="/adminads" element={<AdminAds />} />
                
                <Route path="/admindashboard" element={<AdminDashboard />} />
                
                <Route path="/paymenthistory" element={<PaymentHistory />} />
                
                <Route path="/authpage" element={<AuthPage />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
