json.extract! meeting, :id, :organisation_id, :name, :created_at, :updated_at
json.url meeting_url(meeting, format: :json)
