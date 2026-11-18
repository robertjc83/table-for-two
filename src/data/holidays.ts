// Holiday collections. Tag a recipe with `occasions: [thanksgiving]` etc. to add it to a page.
export const COURSE_ORDER = ['Drink', 'Starter', 'Main', 'Full Menu', 'Side', 'Dessert'] as const;

export const holidays = [
  {
    key: 'thanksgiving',
    slug: 'thanksgiving-dinner-for-two',
    name: 'Thanksgiving',
    emoji: '🦃',
    color: '#c2410c',
    title: 'Thanksgiving Dinner for Two',
    description: 'A complete Thanksgiving dinner for two: herb-roasted turkey breast with gravy, small-batch stuffing, pumpkin crème brûlée and a game plan to cook it together.',
    intro: "Thanksgiving for two doesn't need a 15-pound turkey or three days of prep. This menu has everything you love (turkey, gravy, stuffing, cranberry and pumpkin) scaled down for the two of you, with one cozy afternoon of cooking together.",
    plan: [
      { when: 'The day before', what: 'Make the pumpkin crème brûlée custards and chill them. Cube the bread for stuffing and let it dry out overnight.' },
      { when: '2 hours before dinner', what: 'Herb-butter the turkey and get it in the oven. Make the cranberry sauce while it roasts.' },
      { when: '1 hour before', what: 'Assemble the stuffing and slide it into the oven next to the turkey. Start the mulled wine on low.' },
      { when: '20 minutes before', what: 'Bake the brie and snack on it while the turkey rests. Make the gravy.' },
      { when: 'Dessert', what: 'Torch the crème brûlée tops at the table.' },
    ],
  },
  {
    key: 'christmas',
    slug: 'christmas-dinner-for-two',
    name: 'Christmas',
    emoji: '🎄',
    color: '#15803d',
    title: 'Christmas Dinner for Two',
    description: 'A romantic Christmas Eve dinner for two: baked brie, filet mignon with red wine sauce, mulled wine and a gingerbread cookie decorating date.',
    intro: "Christmas Eve is the perfect night to stay in. Turn on the tree lights, put on the Christmas music, and cook a dinner that feels like a fancy restaurant meal, then spend the rest of the night decorating gingerbread cookies.",
    plan: [
      { when: 'In the afternoon', what: 'Make the gingerbread dough and chill it. Bake the cookies so they can cool before decorating.' },
      { when: '1 hour before dinner', what: 'Start the mulled wine on low. Take the filets out of the fridge to come to room temperature.' },
      { when: '30 minutes before', what: 'Bake the cranberry brie and enjoy it by the tree with a mug of mulled wine.' },
      { when: 'Dinner', what: 'Sear the filets and make the red wine sauce while your partner makes the creamy spinach.' },
      { when: 'After dinner', what: 'Christmas movie, icing bags, and a gingerbread decorating contest.' },
    ],
  },
] as const;
