class MeetingAction < ApplicationRecord
 
  include AASM

  has_paper_trail

  belongs_to :hosted_meeting
  

  validates_presence_of :description, on: [:update, :create], message: "can't be blank"
  validates_presence_of :action_type, on: [:update, :create], message: "can't be blank"

  #delegate :name, to: :hosted_meeting, prefix: true

  broadcasts_to :hosted_meeting


  #delegate :email, :name, :initials, to: :user, prefix: true, allow_nil: true

  
  default_scope { order(created_at: :asc)}
  #default_scope { where(aasm_state: :active).order(created_at: :desc)}
  def organisation
    business_unit.organisation
  end
  def business_unit
    meeting.business_unit
  end
  def meeting
    hosted_meeting.meeting
  end


  aasm do
    state :active, initial: true
    state :future, :closed

    event :close do
      transitions from: [:future, :active], to: :closed
    end
    event :reopen do
      transitions from: [:closed], to: :active
    end

  end


end
