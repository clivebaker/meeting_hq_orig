json.extract! hosted_meeting, :id, :meeting_id, :started_at, :ended_at, :started_by, :agenda, :slides, :created_at, :updated_at
json.url hosted_meeting_url(hosted_meeting, format: :json)
