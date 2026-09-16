import type { BusinessInput } from '../types/business';

export const EXAMPLE_BUSINESS: BusinessInput = {
  businessName: 'Spotify Launchpad',
  website: 'spotify.com/artists',
  description:
    'A hypothetical release-planning and marketing workspace inside Spotify for Artists that helps independent musicians turn an upcoming song, EP, or album into a structured launch campaign. Artists can organize their release timeline, promotional tasks, content plan, audience strategy, and post-release follow-up in one guided experience.',
  targetAudience:
    'Independent and emerging artists who release music themselves or work with very small teams and do not have a dedicated marketing staff.',
  customerProblem:
    'Independent artists often understand how to make music but struggle with what to do before, during, and after a release. Promotion gets scattered across notes, spreadsheets, social platforms, distributor dashboards, email, and guesswork, making it difficult to run a coordinated release campaign.',
  differentiation:
    'Unlike generic project-management or social-planning tools, Spotify Launchpad would organize the marketing workflow around the music release itself and connect that planning experience to the broader Spotify for Artists ecosystem.',
  competitors:
    'Notion, spreadsheets, music marketing agencies, distributor dashboards, social media planning tools, and manual release planning.',
  businessGoal: 'Launch a Product',
  additionalContext:
    'This is a hypothetical Spotify product concept created only as a LaunchKit demo. The product should feel extremely simple for artists who have never studied marketing. The goal is to help artists prepare for a release, reach the right listeners, organize promotion, and learn what worked after launch. It is not an official Spotify product and is not affiliated with Spotify.',
};
