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

import { HashRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

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
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Watch" element={<Watch />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
                <Route path="/ArtistDashboard" element={<ArtistDashboard />} />
                
                <Route path="/UploadVideo" element={<UploadVideo />} />
                
                <Route path="/PlanSelection" element={<PlanSelection />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/AdvertiserDashboard" element={<AdvertiserDashboard />} />
                
                <Route path="/ArtistProfile" element={<ArtistProfile />} />
                
                <Route path="/BecomeArtist" element={<BecomeArtist />} />
                
                <Route path="/ContentModeration" element={<ContentModeration />} />
                
                <Route path="/AdminArtistApplications" element={<AdminArtistApplications />} />
                
                <Route path="/AdminAds" element={<AdminAds />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/PaymentHistory" element={<PaymentHistory />} />
                
                <Route path="/AuthPage" element={<AuthPage />} />
                
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
