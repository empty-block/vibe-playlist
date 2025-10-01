import { Component, Match, Switch } from 'solid-js';
import { ActivityEvent } from '../../data/mockActivity';
import TrackShareActivity from './TrackShareActivity';
import ReplyActivity from './ReplyActivity';
import LikesActivity from './LikesActivity';

interface ActivityItemProps {
  activity: ActivityEvent;
}

const ActivityItem: Component<ActivityItemProps> = (props) => {
  return (
    <Switch>
      <Match when={props.activity.type === 'track_share'}>
        <TrackShareActivity activity={props.activity as any} />
      </Match>
      <Match when={props.activity.type === 'reply'}>
        <ReplyActivity activity={props.activity as any} />
      </Match>
      <Match when={props.activity.type === 'aggregated_likes'}>
        <LikesActivity activity={props.activity as any} />
      </Match>
    </Switch>
  );
};

export default ActivityItem;
