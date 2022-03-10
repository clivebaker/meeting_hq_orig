class HostedMeeting < ApplicationRecord
  belongs_to :meeting

  belongs_to :user, foreign_key: :started_by

  has_many :meeting_actions #, -> { where(aasm_state: :active) }

  default_scope { order(created_at: :desc)}



end
