import { findKey, get } from 'lodash';

import plans, { PLANS_COLLECTIVE_SLUG } from '../constants/plans';

const isHireOrUpgrade = (newPlan: string, oldPlan?: string | null): boolean => {
  return !oldPlan ? true : get(plans, `${newPlan}.tier`) > get(plans, `${oldPlan}.tier`);
};

export async function hireOrUpgradePlan(order): Promise<void> {
  if (!order.collective || !order.fromCollective) await order.populate();

  if (order.tier && order.collective.slug === PLANS_COLLECTIVE_SLUG) {
    const newPlan = findKey(plans, { slug: get(order, 'tier.slug') });

    // Update plan only when hiring or upgrading, we don't want to suspend client's
    // features until the end of the billing. Downgrades are dealt in a cronjob.
    if (newPlan && isHireOrUpgrade(newPlan, order.fromCollective.plan)) {
      await order.fromCollective.update({ plan: newPlan });
    }
  }
}
