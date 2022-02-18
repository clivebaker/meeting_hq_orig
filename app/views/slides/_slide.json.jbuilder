json.extract! slide, :id, :meeting_id, :name, :slide_template_id, :enabled, :data, :created_at, :updated_at
json.url slide_url(slide, format: :json)
