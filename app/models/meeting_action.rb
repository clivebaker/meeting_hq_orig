class MeetingAction < ApplicationRecord
 
  include AASM

  has_paper_trail

  belongs_to :meeting
  belongs_to :user

  acts_as_list scope: [:meeting_id, :aasm_state]

  validates_presence_of :name, on: [:update, :create], message: "can't be blank"

  delegate :name, to: :meeting, prefix: true

  delegate :email, :name, :initials, to: :user, prefix: true

  
  default_scope { order(position: :asc)}
  

  aasm do
    state :active, initial: true
    state :future, :closed

    event :close do
      transitions from: [:future, :active], to: :closed
      after do
     
      end
    end

  end


end
