import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  real,
  jsonb,
  pgEnum,
  varchar,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'family', 'pro'])

export const memberRoleEnum = pgEnum('member_role', ['admin', 'member'])

export const memberRelationEnum = pgEnum('member_relation', [
  'me',
  'husband',
  'wife',
  'son',
  'daughter',
  'mother',
  'father',
  'other',
])

export const undertoneEnum = pgEnum('undertone', ['warm', 'cool', 'neutral'])

export const fitPreferenceEnum = pgEnum('fit_preference', [
  'slim',
  'regular',
  'relaxed',
  'oversized',
])

export const photoTypeEnum = pgEnum('photo_type', ['face', 'full_body', 'outfit'])

export const tryOnStatusEnum = pgEnum('try_on_status', [
  'pending',
  'processing',
  'done',
  'failed',
])

export const fitLabelEnum = pgEnum('fit_label', ['tight', 'regular', 'loose'])

export const videoStatusEnum = pgEnum('video_status', [
  'pending',
  'processing',
  'done',
  'failed',
])

export const videoStyleEnum = pgEnum('video_style', ['runway', 'realistic'])

export const savedItemTypeEnum = pgEnum('saved_item_type', [
  'product',
  'tryon',
  'video',
  'look',
])

export const notificationChannelEnum = pgEnum('notification_channel', [
  'push',
  'in_app',
  'email',
])

export const reviewQueueTypeEnum = pgEnum('review_queue_type', [
  'wardrobe_match',
  'body_size',
  'product_mapping',
])

export const reviewerTypeEnum = pgEnum('reviewer_type', ['user', 'admin'])

export const resolutionEnum = pgEnum('resolution', ['accepted', 'corrected', 'rejected'])

export const crawlerTypeEnum = pgEnum('crawler_type', ['playwright', 'scrapy', 'api'])

export const crawlStatusEnum = pgEnum('crawl_status', [
  'pending',
  'running',
  'completed',
  'failed',
])

// ─── families ────────────────────────────────────────────────────────────────

export const families = pgTable('families', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free').notNull(),
  countryCode: varchar('country_code', { length: 2 }).notNull(),
})

// ─── family_members ───────────────────────────────────────────────────────────

export const familyMembers = pgTable(
  'family_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    familyId: uuid('family_id')
      .notNull()
      .references(() => families.id, { onDelete: 'cascade' }),
    role: memberRoleEnum('role').default('member').notNull(),
    displayName: text('display_name').notNull(),
    relation: memberRelationEnum('relation').notNull(),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('family_members_family_id_idx').on(t.familyId)],
)

// ─── member_profiles ──────────────────────────────────────────────────────────

export const memberProfiles = pgTable('member_profiles', {
  memberId: uuid('member_id')
    .primaryKey()
    .references(() => familyMembers.id, { onDelete: 'cascade' }),
  heightCm: real('height_cm'),
  weightKg: real('weight_kg'),
  bodyShape: text('body_shape'),
  skinToneHex: varchar('skin_tone_hex', { length: 7 }),
  undertone: undertoneEnum('undertone'),
  chestCm: real('chest_cm'),
  waistCm: real('waist_cm'),
  hipCm: real('hip_cm'),
  shoulderCm: real('shoulder_cm'),
  inseamCm: real('inseam_cm'),
  footSizeEu: real('foot_size_eu'),
  clothingSizes: jsonb('clothing_sizes'),
  fitPreference: fitPreferenceEnum('fit_preference'),
  colorPreferences: text('color_preferences').array(),
  avoidColors: text('avoid_colors').array(),
  favoriteBrands: text('favorite_brands').array(),
  occasionPreferences: text('occasion_preferences').array(),
  styleTags: text('style_tags').array(),
  avatar3dUrl: text('avatar_3d_url'),
  lastBodyEstimationAt: timestamp('last_body_estimation_at'),
  bodyConfirmedByUser: boolean('body_confirmed_by_user').default(false).notNull(),
})

// ─── member_photos ────────────────────────────────────────────────────────────

export const memberPhotos = pgTable(
  'member_photos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => familyMembers.id, { onDelete: 'cascade' }),
    type: photoTypeEnum('type').notNull(),
    url: text('url').notNull(),
    consentGivenAt: timestamp('consent_given_at'),
    isPrimary: boolean('is_primary').default(false).notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  },
  (t) => [index('member_photos_member_id_idx').on(t.memberId)],
)

// ─── canonical_dresses ────────────────────────────────────────────────────────

export const canonicalDresses = pgTable('canonical_dresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  primaryImageUrl: text('primary_image_url').notNull(),
  perceptualHash: text('perceptual_hash'),
  type: text('type'),
  color: text('color').array(),
  brand: text('brand'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── brands ───────────────────────────────────────────────────────────────────

export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  websiteUrl: text('website_url'),
  crawlerConfig: jsonb('crawler_config'),
  crawlerType: crawlerTypeEnum('crawler_type').default('playwright').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastCrawlAt: timestamp('last_crawl_at'),
  lastCrawlStatus: crawlStatusEnum('last_crawl_status'),
})

// ─── products ─────────────────────────────────────────────────────────────────

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'set null' }),
    externalId: text('external_id'),
    name: text('name').notNull(),
    description: text('description'),
    url: text('url').notNull(),
    category: text('category').notNull(),
    subCategory: text('sub_category'),
    gender: text('gender'),
    type: text('type'),
    material: text('material'),
    pattern: text('pattern'),
    fit: text('fit'),
    color: text('color').array(),
    occasion: text('occasion').array(),
    season: text('season').array(),
    images: jsonb('images'),
    sizesAvailable: text('sizes_available').array(),
    currentPrice: real('current_price').notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    originalPrice: real('original_price'),
    discountPct: real('discount_pct'),
    inStock: boolean('in_stock').default(true).notNull(),
    isNewArrival: boolean('is_new_arrival').default(false).notNull(),
    isOnSale: boolean('is_on_sale').default(false).notNull(),
    firstSeenAt: timestamp('first_seen_at').defaultNow().notNull(),
    lastUpdatedAt: timestamp('last_updated_at').defaultNow().notNull(),
    lastCrawledAt: timestamp('last_crawled_at'),
    classificationTags: text('classification_tags').array(),
  },
  (t) => [
    index('products_brand_id_idx').on(t.brandId),
    index('products_category_idx').on(t.category),
  ],
)

// ─── product_price_history ────────────────────────────────────────────────────

export const productPriceHistory = pgTable(
  'product_price_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    price: real('price').notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    discountPct: real('discount_pct'),
    inStock: boolean('in_stock').notNull(),
    sizesAvailable: text('sizes_available').array(),
    recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  },
  (t) => [index('price_history_product_id_idx').on(t.productId)],
)

// ─── wardrobe_items ───────────────────────────────────────────────────────────

export const wardrobeItems = pgTable(
  'wardrobe_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => familyMembers.id, { onDelete: 'cascade' }),
    canonicalDressId: uuid('canonical_dress_id').references(() => canonicalDresses.id),
    productId: uuid('product_id').references(() => products.id),
    name: text('name').notNull(),
    type: text('type').notNull(),
    color: text('color').array(),
    occasion: text('occasion').array(),
    category: text('category').notNull(),
    imageUrl: text('image_url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    purchasePrice: real('purchase_price'),
    purchaseCurrency: varchar('purchase_currency', { length: 3 }),
    purchasedAt: timestamp('purchased_at'),
    sourceUrl: text('source_url'),
    wearCount: integer('wear_count').default(0).notNull(),
    lastWornAt: timestamp('last_worn_at'),
    classificationConfidence: real('classification_confidence'),
    confirmedByUser: boolean('confirmed_by_user').default(false).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('wardrobe_items_member_id_idx').on(t.memberId)],
)

// ─── wear_events ──────────────────────────────────────────────────────────────

export const wearEvents = pgTable(
  'wear_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    wardrobeItemId: uuid('wardrobe_item_id')
      .notNull()
      .references(() => wardrobeItems.id, { onDelete: 'cascade' }),
    memberId: uuid('member_id')
      .notNull()
      .references(() => familyMembers.id, { onDelete: 'cascade' }),
    wornAt: timestamp('worn_at').notNull(),
    occasion: text('occasion'),
    outfitPhotoUrl: text('outfit_photo_url'),
    notes: text('notes'),
  },
  (t) => [
    index('wear_events_member_id_idx').on(t.memberId),
    index('wear_events_item_id_idx').on(t.wardrobeItemId),
  ],
)

// ─── crawl_jobs ───────────────────────────────────────────────────────────────

export const crawlJobs = pgTable(
  'crawl_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    brandId: uuid('brand_id')
      .notNull()
      .references(() => brands.id, { onDelete: 'cascade' }),
    startedAt: timestamp('started_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
    status: crawlStatusEnum('status').default('pending').notNull(),
    itemsFound: integer('items_found').default(0).notNull(),
    itemsUpdated: integer('items_updated').default(0).notNull(),
    itemsAdded: integer('items_added').default(0).notNull(),
    itemsFailed: integer('items_failed').default(0).notNull(),
    errorLog: jsonb('error_log'),
    nightlyRunId: text('nightly_run_id'),
  },
  (t) => [index('crawl_jobs_brand_id_idx').on(t.brandId)],
)

// ─── try_on_results ───────────────────────────────────────────────────────────

export const tryOnResults = pgTable(
  'try_on_results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => familyMembers.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id),
    status: tryOnStatusEnum('status').default('pending').notNull(),
    inputAvatarUrl: text('input_avatar_url').notNull(),
    inputProductUrl: text('input_product_url').notNull(),
    outputUrl: text('output_url'),
    fitLabel: fitLabelEnum('fit_label'),
    replicatePredictionId: text('replicate_prediction_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (t) => [index('try_on_results_member_id_idx').on(t.memberId)],
)

// ─── video_previews ───────────────────────────────────────────────────────────

export const videoPreviews = pgTable(
  'video_previews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => familyMembers.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id),
    tryOnResultId: uuid('try_on_result_id').references(() => tryOnResults.id),
    status: videoStatusEnum('status').default('pending').notNull(),
    outputUrl: text('output_url'),
    aspectRatio: text('aspect_ratio'),
    style: videoStyleEnum('style'),
    durationSec: real('duration_sec'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (t) => [index('video_previews_member_id_idx').on(t.memberId)],
)

// ─── saved_items ──────────────────────────────────────────────────────────────

export const savedItems = pgTable(
  'saved_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => familyMembers.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id),
    tryOnResultId: uuid('try_on_result_id').references(() => tryOnResults.id),
    videoPreviewId: uuid('video_preview_id').references(() => videoPreviews.id),
    type: savedItemTypeEnum('type').notNull(),
    occasion: text('occasion'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('saved_items_member_id_idx').on(t.memberId)],
)

// ─── stylist_sessions ─────────────────────────────────────────────────────────

export const stylistSessions = pgTable(
  'stylist_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => familyMembers.id, { onDelete: 'cascade' }),
    messages: jsonb('messages').notNull(),
    contextSnapshot: jsonb('context_snapshot'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('stylist_sessions_member_id_idx').on(t.memberId)],
)

// ─── notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => familyMembers.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    payload: jsonb('payload'),
    channel: notificationChannelEnum('channel').notNull(),
    sentAt: timestamp('sent_at'),
    readAt: timestamp('read_at'),
    clickedAt: timestamp('clicked_at'),
  },
  (t) => [index('notifications_member_id_idx').on(t.memberId)],
)

// ─── notification_preferences ─────────────────────────────────────────────────

export const notificationPreferences = pgTable('notification_preferences', {
  memberId: uuid('member_id')
    .primaryKey()
    .references(() => familyMembers.id, { onDelete: 'cascade' }),
  discounts: boolean('discounts').default(true).notNull(),
  restocks: boolean('restocks').default(true).notNull(),
  eventRecs: boolean('event_recs').default(true).notNull(),
  wardrobeReminders: boolean('wardrobe_reminders').default(true).notNull(),
  newOutfitMatches: boolean('new_outfit_matches').default(true).notNull(),
  quietHoursStart: integer('quiet_hours_start'),
  quietHoursEnd: integer('quiet_hours_end'),
})

// ─── review_queue ─────────────────────────────────────────────────────────────

export const reviewQueue = pgTable('review_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: reviewQueueTypeEnum('type').notNull(),
  entityId: uuid('entity_id').notNull(),
  entityType: text('entity_type').notNull(),
  confidenceScore: real('confidence_score'),
  aiSuggestion: jsonb('ai_suggestion'),
  reviewedAt: timestamp('reviewed_at'),
  reviewerType: reviewerTypeEnum('reviewer_type'),
  resolution: resolutionEnum('resolution'),
  correction: jsonb('correction'),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const familiesRelations = relations(families, ({ many }) => ({
  members: many(familyMembers),
}))

export const familyMembersRelations = relations(familyMembers, ({ one, many }) => ({
  family: one(families, { fields: [familyMembers.familyId], references: [families.id] }),
  profile: one(memberProfiles, {
    fields: [familyMembers.id],
    references: [memberProfiles.memberId],
  }),
  photos: many(memberPhotos),
  wardrobeItems: many(wardrobeItems),
  tryOnResults: many(tryOnResults),
  videoPreviews: many(videoPreviews),
  savedItems: many(savedItems),
  stylistSessions: many(stylistSessions),
  notifications: many(notifications),
  notificationPreferences: one(notificationPreferences, {
    fields: [familyMembers.id],
    references: [notificationPreferences.memberId],
  }),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  priceHistory: many(productPriceHistory),
}))

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
  crawlJobs: many(crawlJobs),
}))
