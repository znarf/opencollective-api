import { expect } from 'chai';

import * as utils from '../../utils';
import models from '../../../server/models';
import plans, { PLANS_COLLECTIVE_SLUG } from '../../../server/constants/plans';
import { hireOrUpgradePlan } from '../../../server/lib/plans';

describe('lib/plans.ts', () => {
  let collective, user, order;

  beforeEach(utils.resetTestDB);
  beforeEach(async () => {
    user = await models.User.createUserWithCollective(utils.data('user3'));
    collective = await models.Collective.create({
      ...utils.data('collective1'),
      slug: PLANS_COLLECTIVE_SLUG,
    });
    const tier = await models.Tier.create({
      ...utils.data('tier1'),
      slug: plans['small'].slug,
    });
    order = await models.Order.create({
      CreatedByUserId: user.id,
      FromCollectiveId: user.CollectiveId,
      CollectiveId: collective.id,
      totalAmount: 1000,
      currency: 'EUR',
      TierId: tier.id,
    });
  });

  it('should ignore if it is not an order for opencollective', async () => {
    const tier = await models.Tier.create({
      ...utils.data('tier1'),
      slug: plans['small'].slug,
    });
    const othercollective = await models.Collective.create(utils.data('collective1'));
    const otherorder = await models.Order.create({
      CreatedByUserId: user.id,
      FromCollectiveId: user.CollectiveId,
      CollectiveId: othercollective.id,
      totalAmount: 1000,
      currency: 'EUR',
      TierId: tier.id,
    });

    await hireOrUpgradePlan(otherorder);

    await user.collective.reload();
    expect(user.collective.plan).to.equal(null);
  });

  it('should ignore if it is not a tier plan', async () => {
    const tier = await models.Tier.create({
      ...utils.data('tier1'),
      slug: 'tshirt',
    });
    const otherorder = await models.Order.create({
      CreatedByUserId: user.id,
      FromCollectiveId: user.CollectiveId,
      CollectiveId: collective.id,
      totalAmount: 1000,
      currency: 'EUR',
      TierId: tier.id,
    });

    await hireOrUpgradePlan(otherorder);

    await user.collective.reload();
    expect(user.collective.plan).to.equal(null);
  });

  it('should update plan when hiring the first time', async () => {
    await hireOrUpgradePlan(order);

    await user.collective.reload();
    expect(user.collective.plan).to.equal('small');
  });

  it('should upgrade plan to unlock features', async () => {
    await hireOrUpgradePlan(order);

    const tier = await models.Tier.create({
      ...utils.data('tier1'),
      slug: plans['medium'].slug,
    });
    const mediumOrder = await models.Order.create({
      CreatedByUserId: user.id,
      FromCollectiveId: user.CollectiveId,
      CollectiveId: collective.id,
      totalAmount: 1000,
      currency: 'EUR',
      TierId: tier.id,
    });
    await hireOrUpgradePlan(mediumOrder);

    await user.collective.reload();
    expect(user.collective.plan).to.equal('medium');
  });

  it("shouldn't downgrade existing plan", async () => {
    const tier = await models.Tier.create({
      ...utils.data('tier1'),
      slug: plans['medium'].slug,
    });
    const mediumOrder = await models.Order.create({
      CreatedByUserId: user.id,
      FromCollectiveId: user.CollectiveId,
      CollectiveId: collective.id,
      totalAmount: 1000,
      currency: 'EUR',
      TierId: tier.id,
    });
    await hireOrUpgradePlan(mediumOrder);
    await hireOrUpgradePlan(order);

    await user.collective.reload();
    expect(user.collective.plan).to.equal('medium');
  });
});
