import * as Yup from 'yup';
import { parseISO, isBefore } from 'date-fns';

import Meetup from '../models/Meetup';

class MeetupController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { date } = req.body;

    /**
     * Check for past dates
     */
    const meetupDate = parseISO(date);

    if (isBefore(meetupDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not allowed' });
    }

    const meetup = await Meetup.create({
      user_id: req.userId,
      ...req.body,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { date } = req.body;

    /**
     * Check for past dates
     */
    const meetupDate = parseISO(date);

    if (isBefore(meetupDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not allowed' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    const { user_id, date: oldDate } = meetup;

    if (user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to edit this meetup.",
      });
    }

    if (isBefore(oldDate, new Date())) {
      return res.status(401).json({
        error: "You can only edit meetups that haven't happened yet.",
      });
    }

    const updatedMeetup = await meetup.update(req.body);

    return res.json(updatedMeetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);
    const { user_id, date } = meetup;

    if (user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to delete this meetup.",
      });
    }

    if (isBefore(date, new Date())) {
      return res.status(401).json({
        error: "You can only delete meetups that haven't happened yet.",
      });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
