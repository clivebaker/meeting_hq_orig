json.extract! meeting, :id, :business_unit_id, :name, :created_at, :updated_at
json.url meeting_url(meeting, format: :json)
