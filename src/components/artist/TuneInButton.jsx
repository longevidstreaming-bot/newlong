
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/api/entities';
import { Subscription } from '@/api/entities';
import { Rss, Check } from 'lucide-react';

export default function TuneInButton({ artistId }) {
  const [isTunedIn, setIsTunedIn] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!artistId) return;
      
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        
        const [artistSubscriptions, mySubscriptions] = await Promise.all([
          Subscription.filter({ artist_id: artistId }),
          Subscription.filter({ fan_id: user.id, artist_id: artistId })
        ]);

        setSubscriberCount(artistSubscriptions.length);

        if (mySubscriptions.length > 0) {
          setIsTunedIn(true);
          setSubscriptionId(mySubscriptions[0].id);
        } else {
          setIsTunedIn(false);
          setSubscriptionId(null);
        }
      } catch (error) {
        // User not logged in, fetch only public data
        const artistSubscriptions = await Subscription.filter({ artist_id: artistId });
        setSubscriberCount(artistSubscriptions.length);
        setIsTunedIn(false);
      }
      setIsLoading(false);
    };

    checkSubscription();
  }, [artistId]);

  const handleTuneIn = async () => {
    if (!currentUser) {
      User.login();
      return;
    }
    
    setIsLoading(true);
    if (isTunedIn && subscriptionId) {
      // Unsubscribe
      await Subscription.delete(subscriptionId);
      setIsTunedIn(false);
      setSubscriptionId(null);
      setSubscriberCount(prev => prev - 1);
    } else {
      // Subscribe
      const artist = await User.get(artistId);
      const newSub = await Subscription.create({
        fan_id: currentUser.id,
        artist_id: artistId,
        artist_name: artist.artist_name,
      });
      setIsTunedIn(true);
      setSubscriptionId(newSub.id);
      setSubscriberCount(prev => prev + 1);
    }
    setIsLoading(false);
  };
  
  const formatSubscribers = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count;
  }

  return (
    <Button
      onClick={handleTuneIn}
      disabled={isLoading}
      className={`font-semibold transition-all duration-300 px-4 py-2 rounded-full text-sm ${
        isTunedIn 
        ? 'bg-[#2C2C3E] text-[#B0B0B0] hover:bg-[#3C3C4E]'
        : 'bg-white text-black hover:bg-gray-100'
      }`}
    >
      {isTunedIn ? 'Sintonizado' : 'Sintonizar'} {formatSubscribers(subscriberCount)}
    </Button>
  );
}
