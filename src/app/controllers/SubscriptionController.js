import { isBefore } from 'date-fns';

import Subscription from '../models/Subscription';
import User from '../models/User';
import Meetup from '../models/Meetup';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

class SubscriptionController {
  async store(req, res) {
    const user = User.findByPk(req.userId);
    const meetup = Meetup.findByPk(req.params.meetupId, {
      include: [User],
    });

    if (isBefore(meetup.date, new Date())) {
      return res
        .status(400)
        .json({ error: 'You can not subscribe to past meetups.' });
    }

    if (meetup.user_id === user.id) {
      return res
        .status(400)
        .json({ error: 'You can not subscribe to your own meetup.' });
    }

    const checkSubscription = Subscription.findOne({
      where: {
        user_id: user.id,
        meetup_id: meetup.id,
      },
    });

    if (checkSubscription) {
      return res
        .status(400)
        .json({ error: 'Already subscribed on this meetup.' });
    }

    const checkDate = Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res
        .status(400)
        .json({ error: 'You can not subscribe to meetups at the same time.' });
    }

    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
