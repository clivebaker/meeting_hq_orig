json.extract! agenda, :id, :meeting_id, :name, :position, :state, :created_at, :updated_at
json.url agenda_url(agenda, format: :json)
