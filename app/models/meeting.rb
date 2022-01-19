class Meeting < ApplicationRecord

  has_paper_trail

  belongs_to :organisation

  has_many :agendas , -> { where(aasm_state: :active).order(position: :asc) }
  has_many :meeting_actions , -> { where(aasm_state: :active).order(position: :asc) }
  
  validates_presence_of :name, on: [:update, :create], message: "can't be blank"
  validates_uniqueness_of :name, scope: :organisation_id, on: [:update, :create], message: "must be unique"

  delegate :name, to: :organisation, prefix: true



end
