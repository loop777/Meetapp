import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;
    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: 'Novo inscrito',
      template: 'subscription',
      context: {
        organizer: meetup.user.name,
        meetup: meetup.title,
        name: user.name,
        email: user.email,
      },
    });
  }
}

export default new SubscriptionMail();
