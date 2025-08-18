import { Component, Show } from 'solid-js';
import { currentUser, isAuthenticated } from '../stores/authStore';
import LandingPageA from './LandingPageA';
import PersonalDashboard from '../components/common/PersonalDashboard';

const SmartHomePage: Component = () => {
  return (
    <Show
      when={isAuthenticated()}
      fallback={<LandingPageA />}
    >
      <PersonalDashboard />
    </Show>
  );
};

export default SmartHomePage;