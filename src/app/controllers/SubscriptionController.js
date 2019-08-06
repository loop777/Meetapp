import { isBefore } from 'date-fns';
import { Op } from 'sequelize';

import Subscription from '../models/Subscription';
import User from '../models/User';
import Meetup from '../models/Meetup';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [['meetup', 'date']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [{ model: User, as: 'user' }],
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

    const checkSubscription = await Subscription.findOne({
      where: {
        user_id: user.id,
        meetup_id: meetup.id,
      },
    });

    if (checkSubscription) {
      return res
        .status(400)
        .json({ error: 'Already subscribed to this meetup.' });
    }

    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
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
