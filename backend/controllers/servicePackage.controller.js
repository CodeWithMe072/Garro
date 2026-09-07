import ServicePackage from '../models/ServicePackage.js';

const DEFAULT_PACKAGES = [
  {
    title: 'Essential Care',
    subtitle: 'Routine maintenance, done right.',
    price: 499,
    currency: 'AED',
    icon: 'wrench',
    isPopular: false,
    includesHeader: 'Includes:',
    includes: [
      'Engine oil & filter change',
      'Basic inspection (key components)',
      'Top-up of essential fluids',
      'Tyre & brake visual check',
      'Pickup & delivery (where applicable)'
    ],
    bestForNote: 'Best for everyday vehicle owners who want reliable, hassle-free service.',
    buttonText: 'Book Now',
    active: true,
    displayOrder: 1
  },
  {
    title: 'Smart Care',
    subtitle: 'More coverage. More peace of mind.',
    price: 999,
    currency: 'AED',
    icon: 'gear',
    isPopular: true,
    includesHeader: 'Includes everything in Essential, plus:',
    includes: [
      'Full vehicle inspection',
      'Diagnostic scan',
      'A/C system check',
      'Battery check',
      'Brake inspection (detailed)',
      'Suspension check',
      'Pickup & delivery (where applicable)'
    ],
    bestForNote: 'Best for drivers who want more preventative care and fewer surprises.',
    buttonText: 'Book Now',
    active: true,
    displayOrder: 2
  },
  {
    title: 'Signature Care',
    subtitle: 'For those who expect more.',
    price: 1499,
    currency: 'AED',
    icon: 'crown',
    isPopular: false,
    includesHeader: 'Includes everything in Smart, plus:',
    includes: [
      'Extended vehicle health check',
      'Priority booking',
      'Dedicated service support',
      'Detailed inspection report',
      'Service coordination for additional work',
      'Pickup & delivery (where applicable)'
    ],
    bestForNote: 'Best for premium/luxury vehicles or owners who value maximum convenience.',
    buttonText: 'Book Now',
    active: true,
    displayOrder: 3
  }
];

/**
 * GET /api/packages — Public endpoint to fetch active service packages. Auto-seeds if empty.
 */
export const getPublicPackages = async (req, res) => {
  try {
    let packages = await ServicePackage.find({ active: true }).sort({ displayOrder: 1, createdAt: 1 });

    if (packages.length === 0) {
      // Auto-seed default packages on first query
      await ServicePackage.insertMany(DEFAULT_PACKAGES);
      packages = await ServicePackage.find({ active: true }).sort({ displayOrder: 1, createdAt: 1 });
    }

    res.json({ success: true, packages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/packages — Admin endpoint to fetch all packages (active & inactive).
 */
export const getAdminPackages = async (req, res) => {
  try {
    let packages = await ServicePackage.find().sort({ displayOrder: 1, createdAt: 1 });

    if (packages.length === 0) {
      await ServicePackage.insertMany(DEFAULT_PACKAGES);
      packages = await ServicePackage.find().sort({ displayOrder: 1, createdAt: 1 });
    }

    res.json({ success: true, packages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/admin/packages — Admin endpoint to create a new service package.
 */
export const createPackage = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      price,
      currency,
      icon,
      isPopular,
      includesHeader,
      includes,
      bestForNote,
      buttonText,
      active,
      displayOrder
    } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ success: false, message: 'Title and Price are required.' });
    }

    const pkg = new ServicePackage({
      title,
      subtitle: subtitle || '',
      price: Number(price),
      currency: currency || 'AED',
      icon: icon || 'wrench',
      isPopular: Boolean(isPopular),
      includesHeader: includesHeader || 'Includes:',
      includes: Array.isArray(includes) ? includes : [],
      bestForNote: bestForNote || '',
      buttonText: buttonText || 'Book Now',
      active: active !== undefined ? Boolean(active) : true,
      displayOrder: Number(displayOrder) || 0
    });

    await pkg.save();
    res.status(201).json({ success: true, package: pkg, message: 'Package created successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/admin/packages/:id — Admin endpoint to update an existing service package.
 */
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await ServicePackage.findById(id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    const fields = [
      'title', 'subtitle', 'price', 'currency', 'icon',
      'isPopular', 'includesHeader', 'includes', 'bestForNote',
      'buttonText', 'active', 'displayOrder'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        pkg[field] = req.body[field];
      }
    });

    await pkg.save();
    res.json({ success: true, package: pkg, message: 'Package updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/admin/packages/:id — Admin endpoint to delete a service package.
 */
export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await ServicePackage.findByIdAndDelete(id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    res.json({ success: true, message: 'Package deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
