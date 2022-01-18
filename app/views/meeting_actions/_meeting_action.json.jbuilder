json.extract! meeting_action, :id, :meeting_id, :name, :note, :position, :state, :user_id, :created_at, :updated_at
json.url meeting_action_url(meeting_action, format: :json)
