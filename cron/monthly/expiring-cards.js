#!/usr/bin/env node
import '../../server/env';

import logger from '../../server/lib/logger';
import models from '../../server/models';
import * as libPayments from '../../server/lib/payments';

// Only run on the first of the month
const today = new Date();
const date = today.getDate();
const month = today.getMonth();
const year = today.getFullYear();

if (process.env.NODE_ENV === 'production' && date !== 1) {
  console.log('NODE_ENV is production and today is not the first of month, script aborted!');
  process.exit();
}

process.env.PORT = 3066;

const fetchExpiringCreditCards = async (month, year) => {
  const expiringCards = await models.PaymentMethod.findAll({
    where: {
      type: 'creditcard',
      data: {
        expMonth: month,
        expYear: year,
      },
    },
  });

  return expiringCards;
};

const fetchCollectiveData = async id => {
  const collective = await models.Collective.findOne({
    where: {
      id,
    },
  });

  return collective;
};

const fetchUserData = async id => {
  const user = await models.User.findOne({
    where: {
      id,
    },
  });

  return user;
};

const run = async () => {
  const cards = await fetchExpiringCreditCards(month, year);

  for (const card of cards) {
    try {
      const { id, CollectiveId } = card;

      const collective = await fetchCollectiveData(CollectiveId);
      const user = await fetchUserData(collective.CreatedByUserId);

      const { slug } = collective;
      const { firstName, email } = user;
      const userId = user.id;

      const data = {
        id,
        userId,
        CollectiveId,
        slug,
        firstName,
        email,
      };

      await libPayments.sendExpiringCreditCardUpdateEmail(data);
    } catch (e) {
      console.log(e);
    }
  }

  logger.info('Done sending credit card update emails.');
  process.exit();
};

run();
