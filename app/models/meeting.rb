class Meeting < ApplicationRecord

  has_paper_trail

  belongs_to :business_unit
  has_many :hosted_meetings

  has_many :agendas , -> { where(aasm_state: :active).order(position: :asc) }
  has_many :meeting_actions, -> { where(aasm_state: :active).order(position: :asc) }
  
  validates_presence_of :name, on: [:update, :create], message: "can't be blank"
  validates_uniqueness_of :name, scope: :business_unit_id, on: [:update, :create], message: "must be unique"

  delegate :name, to: :business_unit, prefix: true



  def hosted_meeting_running
    hosted_meetings.select{|s| s.ended_at.blank?}.blank?
  end

  def running_meeting
    
    id = nil
    hm = hosted_meetings.select{|s| s.ended_at.blank?}
    id = hm.first.id if hm.present?
    
    id
  end
end
