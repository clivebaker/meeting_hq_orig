class HostedMeeting < ApplicationRecord
  belongs_to :meeting

  belongs_to :user, foreign_key: :started_by


  default_scope { order(created_at: :desc)}
end
