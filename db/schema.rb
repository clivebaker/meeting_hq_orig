# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2022_03_06_125328) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "agendas", force: :cascade do |t|
    t.bigint "meeting_id", null: false
    t.string "name"
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "aasm_state"
    t.integer "duration_minutes"
    t.index ["meeting_id"], name: "index_agendas_on_meeting_id"
  end

  create_table "components", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "hosted_meetings", force: :cascade do |t|
    t.bigint "meeting_id", null: false
    t.datetime "started_at", precision: nil
    t.datetime "ended_at", precision: nil
    t.integer "started_by"
    t.jsonb "agenda", default: {}
    t.jsonb "slides", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["meeting_id"], name: "index_hosted_meetings_on_meeting_id"
  end

  create_table "master_slide_template_components", force: :cascade do |t|
    t.bigint "master_slide_template_id", null: false
    t.bigint "component_id", null: false
    t.integer "top", default: 0
    t.integer "left", default: 0
    t.integer "width", default: 200
    t.integer "height", default: 30
    t.jsonb "settings", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "content"
    t.string "name"
    t.index ["component_id"], name: "index_master_slide_template_components_on_component_id"
    t.index ["master_slide_template_id"], name: "mstc_template_id"
  end

  create_table "master_slide_templates", force: :cascade do |t|
    t.string "name"
    t.boolean "enabled"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "meeting_actions", force: :cascade do |t|
    t.bigint "meeting_id", null: false
    t.string "name"
    t.text "note"
    t.integer "position"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "aasm_state"
    t.index ["meeting_id"], name: "index_meeting_actions_on_meeting_id"
    t.index ["user_id"], name: "index_meeting_actions_on_user_id"
  end

  create_table "meetings", force: :cascade do |t|
    t.bigint "organisation_id", null: false
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organisation_id"], name: "index_meetings_on_organisation_id"
  end

  create_table "organisation_users", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "organisation_id", null: false
    t.jsonb "role", default: []
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "invited", default: false
    t.datetime "discarded_at"
    t.index ["discarded_at"], name: "index_organisation_users_on_discarded_at"
    t.index ["organisation_id"], name: "index_organisation_users_on_organisation_id"
    t.index ["user_id"], name: "index_organisation_users_on_user_id"
  end

  create_table "organisations", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "slide_template_components", force: :cascade do |t|
    t.bigint "slide_template_id", null: false
    t.bigint "component_id", null: false
    t.integer "top", default: 0
    t.integer "left", default: 0
    t.integer "width", default: 200
    t.integer "height", default: 30
    t.jsonb "settings"
    t.text "content"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["component_id"], name: "index_slide_template_components_on_component_id"
    t.index ["slide_template_id"], name: "index_slide_template_components_on_slide_template_id"
  end

  create_table "slide_templates", force: :cascade do |t|
    t.bigint "organisation_id", null: false
    t.string "name"
    t.text "content"
    t.boolean "enabled"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organisation_id"], name: "index_slide_templates_on_organisation_id"
  end

  create_table "slides", force: :cascade do |t|
    t.bigint "meeting_id", null: false
    t.string "name"
    t.bigint "slide_template_id", null: false
    t.boolean "enabled"
    t.jsonb "data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["meeting_id"], name: "index_slides_on_meeting_id"
    t.index ["slide_template_id"], name: "index_slides_on_slide_template_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "invitation_token"
    t.datetime "invitation_created_at"
    t.datetime "invitation_sent_at"
    t.datetime "invitation_accepted_at"
    t.integer "invitation_limit"
    t.string "invited_by_type"
    t.bigint "invited_by_id"
    t.integer "invitations_count", default: 0
    t.string "first_name"
    t.string "last_name"
    t.boolean "super_admin", default: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["invitation_token"], name: "index_users_on_invitation_token", unique: true
    t.index ["invited_by_id"], name: "index_users_on_invited_by_id"
    t.index ["invited_by_type", "invited_by_id"], name: "index_users_on_invited_by"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "versions", force: :cascade do |t|
    t.string "item_type"
    t.string "{:null=>false}"
    t.bigint "item_id", null: false
    t.string "event", null: false
    t.string "whodunnit"
    t.text "object"
    t.datetime "created_at"
    t.text "object_changes"
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

  add_foreign_key "agendas", "meetings"
  add_foreign_key "hosted_meetings", "meetings"
  add_foreign_key "master_slide_template_components", "components"
  add_foreign_key "master_slide_template_components", "master_slide_templates"
  add_foreign_key "meeting_actions", "meetings"
  add_foreign_key "meeting_actions", "users"
  add_foreign_key "meetings", "organisations"
  add_foreign_key "organisation_users", "organisations"
  add_foreign_key "organisation_users", "users"
  add_foreign_key "slide_template_components", "components"
  add_foreign_key "slide_template_components", "slide_templates"
  add_foreign_key "slide_templates", "organisations"
  add_foreign_key "slides", "meetings"
  add_foreign_key "slides", "slide_templates"
end
